<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;

class AdminLogController extends Controller
{
    private $logPath;

    public function __construct()
    {
        $this->logPath = storage_path('logs');
    }

    private function checkSuperAdmin()
    {
        if (auth()->guard('admin')->check() && auth()->guard('admin')->user()->role !== 'super_admin') {
            abort(403, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ Super Admin)');
        }
    }

    public function index(Request $request)
    {
        $this->checkSuperAdmin();

        $dateFilter = $request->query('file_date');
        $files = $this->getLogFiles($dateFilter);
        $selectedFile = $request->query('file', 'laravel.log');

        // Check if selected file exists
        if (!in_array($selectedFile, $files)) {
            $selectedFile = count($files) > 0 ? $files[0] : null;
        }

        $logs = [];
        if ($selectedFile) {
            $logs = $this->parseLogFile(
                $selectedFile, 
                $request->query('search'), 
                $request->query('level'),
                $request->query('start_date'),
                $request->query('end_date')
            );
        }

        return Inertia::render('Admin/Logs/Index', [
            'files' => $files,
            'selectedFile' => $selectedFile,
            'logs' => $logs,
            'filters' => $request->only(['file', 'search', 'level', 'start_date', 'end_date', 'file_date']),
        ]);
    }

    private function getLogFiles($dateFilter = null)
    {
        if (!File::exists($this->logPath)) {
            return [];
        }

        $files = File::files($this->logPath);
        $logFiles = [];

        foreach ($files as $file) {
            if ($file->getExtension() === 'log') {
                $filename = $file->getFilename();
                
                if ($dateFilter) {
                    // Check if date is in filename (daily logs) or matches modified date
                    $modifiedDate = date('Y-m-d', File::lastModified($file->getPathname()));
                    if (!str_contains($filename, $dateFilter) && $modifiedDate !== $dateFilter) {
                        continue;
                    }
                }

                $logFiles[] = $filename;
            }
        }

        // Sort files by last modified time desc
        usort($logFiles, function ($a, $b) {
            return File::lastModified($this->logPath . '/' . $b) <=> File::lastModified($this->logPath . '/' . $a);
        });

        return $logFiles;
    }

    private function parseLogFile($filename, $search = null, $level = null, $startDate = null, $endDate = null)
    {
        $path = $this->logPath . '/' . $filename;
        if (!File::exists($path)) {
            return [];
        }

        // Read file (limit to last 1000 lines for performance)
        $content = shell_exec("tail -n 1000 " . escapeshellarg($path));
        if (!$content) {
            // Fallback for environments without tail
            $content = File::get($path);
            $lines = explode("\n", $content);
            $lines = array_slice($lines, -1000);
            $content = implode("\n", $lines);
        }

        // Regex to match Laravel/Monolog log format:
        // [YYYY-MM-DD HH:MM:SS] environment.LEVEL: message {"context":...} [extra]
        $pattern = '/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.*)/';
        
        $lines = explode("\n", $content);
        $parsedLogs = [];
        $currentLog = null;

        foreach ($lines as $line) {
            if (empty(trim($line))) continue;

            if (preg_match($pattern, $line, $matches)) {
                if ($currentLog) {
                    if ($this->shouldIncludeLog($currentLog, $search, $level, $startDate, $endDate)) {
                        $parsedLogs[] = $currentLog;
                    }
                }

                $currentLog = [
                    'timestamp' => $matches[1],
                    'env' => $matches[2],
                    'level' => strtoupper($matches[3]),
                    'message' => $matches[4],
                    'full_text' => $line
                ];
            } else if ($currentLog) {
                // Multi-line stack trace or context
                $currentLog['message'] .= "\n" . $line;
                $currentLog['full_text'] .= "\n" . $line;
            }
        }

        if ($currentLog && $this->shouldIncludeLog($currentLog, $search, $level, $startDate, $endDate)) {
            $parsedLogs[] = $currentLog;
        }

        return array_reverse($parsedLogs);
    }

    private function shouldIncludeLog($log, $search, $level, $startDate, $endDate)
    {
        if ($level && $log['level'] !== strtoupper($level)) {
            return false;
        }

        if ($search && stripos($log['full_text'], $search) === false) {
            return false;
        }

        if ($startDate || $endDate) {
            $logDate = substr($log['timestamp'], 0, 10); // Extract YYYY-MM-DD
            
            if ($startDate && $logDate < $startDate) {
                return false;
            }
            
            if ($endDate && $logDate > $endDate) {
                return false;
            }
        }

        return true;
    }

    public function download($filename)
    {
        $this->checkSuperAdmin();

        $path = $this->logPath . '/' . $filename;
        if (!File::exists($path)) {
            abort(404);
        }

        return Response::download($path);
    }

    public function destroy($filename)
    {
        $this->checkSuperAdmin();

        $path = $this->logPath . '/' . $filename;
        if (File::exists($path)) {
            File::put($path, ''); // Empty the file instead of deleting
            return back()->with('success', 'Log file cleared successfully.');
        }

        return back()->with('error', 'Log file not found.');
    }
}
