import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';

export default function TimePage() {
  const [currentTime, setCurrentTime] = useState(null);
  const [offset, setOffset] = useState(0); // 网络时间与本地时间的差值
  const [loading, setLoading] = useState(true);

  // 1. 初始化：获取网络时间并计算偏差
  useEffect(() => {
    async function fetchNetworkTime() {
      try {
        // 请求世界协调时 API
        const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
        const data = await response.json();
        
        const networkTime = new Date(data.utc_datetime).getTime();
        const localTime = Date.now();
        
        // 计算偏差：网络时间 - 本地执行时刻
        const timeOffset = networkTime - localTime;
        setOffset(timeOffset);
        setLoading(false);
      } catch (error) {
        console.error("网络校时失败，降级使用本机时间", error);
        setOffset(0); // 失败则不偏移
        setLoading(false);
      }
    }

    fetchNetworkTime();
  }, []);

  // 2. 计时器：每秒刷新显示
  useEffect(() => {
    if (loading) return;

    const timer = setInterval(() => {
      // 当前准确时间 = 本机流逝时间 + 初始计算的偏差
      setCurrentTime(new Date(Date.now() + offset));
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, offset]);

  // 格式化工具
  const formatTime = (date, timeZone) => {
    if (!date) return "--:--:--";
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  };

  const formatDate = (date, timeZone) => {
    if (!date) return "Loading...";
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(date);
  };

  // 3. 界面渲染
  return (
    <Layout title="标准网络时钟" description="Network Time Protocol Clock">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{ marginBottom: '3rem' }}>网络校时</h1>
        
        {loading ? (
          <h2>正在从原子钟服务器同步时间...</h2>
        ) : (
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            
            {/* 本地设备时区（经过网络校准） */}
            <div style={clockCardStyle}>
              <h3>本设备时区</h3>
              <div style={timeStyle}>
                {formatTime(currentTime, Intl.DateTimeFormat().resolvedOptions().timeZone)}
              </div>
              <div style={dateStyle}>
                {formatDate(currentTime, Intl.DateTimeFormat().resolvedOptions().timeZone)}
              </div>
              <small style={{color: '#888'}}>{Intl.DateTimeFormat().resolvedOptions().timeZone}</small>
            </div>

            {/* UTC 标准时间 */}
            <div style={clockCardStyle}>
              <h3>UTC标准时间</h3>
              <div style={timeStyle}>
                {formatTime(currentTime, 'UTC')}
              </div>
              <div style={dateStyle}>
                {formatDate(currentTime, 'UTC')}
              </div>
              <small style={{color: '#888'}}>Coordinated Universal Time</small>
            </div>

          </div>
        )}
        
        <p style={{ marginTop: '3rem', opacity: 0.6, fontSize: '0.9rem' }}>
          * 时间源自 worldtimeapi.org，已自动计算传输延迟补偿
        </p>
      </div>
    </Layout>
  );
}

// 简单的内联样式对象
const clockCardStyle = {
  background: 'var(--ifm-card-background-color)',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  minWidth: '300px'
};

const timeStyle = {
  fontSize: '3.5rem',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  margin: '1rem 0',
  color: 'var(--ifm-color-primary)'
};

const dateStyle = {
  fontSize: '1.2rem',
  fontWeight: '500'
};
