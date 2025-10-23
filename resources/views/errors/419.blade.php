@extends('errors::minimal')

{{-- @section('title', __('Session หมดอายุ'))
@section('code', '419')
@section('message', __('เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่')) --}}

{{-- @section('content')
    <div style="text-align:center; padding: 40px;">
        <h2>⚠️ Session หมดอายุแล้ว</h2>
        <p>กรุณารีเฟรชหน้า หรือล็อกอินใหม่เพื่อดำเนินการต่อ</p>
        <a href="{{ route('login') }}" style="padding:10px 20px; background:#F54927; color:white; border-radius:6px; text-decoration:none;">เข้าสู่ระบบใหม่</a>
    </div>
@endsection --}}

<div
    style="
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;          /* เต็มความสูงหน้าจอ */
    background: #f8fafc;    /* สีพื้นหลังอ่อน */
    text-align: center;
    font-family: 'Sarabun', sans-serif;
">
    <h2 style="font-size: 1.5rem; font-weight: 700; color: #333; margin-bottom: 10px;">
        ⚠️ Session หมดอายุแล้ว
    </h2>
    <p style="color: #555; margin-bottom: 25px;">
        กรุณารีเฟรชหน้า หรือล็อกอินใหม่เพื่อดำเนินการต่อ
    </p>
    <a href="{{ route('login') }}"
        style="padding:10px 24px; background:#F54927; color:white; border-radius:6px; text-decoration:none; font-weight:600;">
        เข้าสู่ระบบใหม่
    </a>
</div>
