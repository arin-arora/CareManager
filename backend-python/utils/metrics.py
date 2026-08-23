import time
import os
import resource

start_time = time.time()

# Global metrics and diagnostic state tracking
metrics_state = {
    "last_successful_request_time": "Never",
    "last_latency": 0.0,
    "cache_hits": 0,
    "cache_misses": 0,
    "total_requests": 0,
    "last_error": None,
    "groq_auth_status": "Not Tested"
}

def record_request(latency: float, success: bool = True, error: str = None):
    """Record request latency, success state, and error logs."""
    metrics_state["total_requests"] += 1
    metrics_state["last_latency"] = round(latency, 3)
    if success:
        metrics_state["last_successful_request_time"] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        metrics_state["groq_auth_status"] = "Connected"
    else:
        metrics_state["groq_auth_status"] = f"Failed: {error}" if error else "Failed"
        metrics_state["last_error"] = error

def record_cache(hit: bool):
    """Record cache hit or miss events."""
    if hit:
        metrics_state["cache_hits"] += 1
    else:
        metrics_state["cache_misses"] += 1

def get_system_metrics():
    """Retrieve process memory (MB), CPU load, and uptime (seconds)."""
    uptime = int(time.time() - start_time)
    
    # Try reading Linux proc filesystem for accurate memory VmRSS
    mem_mb = 0.0
    try:
        if os.path.exists("/proc/self/status"):
            with open("/proc/self/status", "r") as f:
                for line in f:
                    if line.startswith("VmRSS:"):
                        mem_mb = int(line.split()[1]) / 1024.0
                        break
    except Exception:
        pass
        
    if mem_mb == 0.0:
        # Fallback to getrusage RSS measurements
        rusage = resource.getrusage(resource.RUSAGE_SELF)
        # On macOS ru_maxrss is in bytes; on Linux it is in kilobytes
        if os.uname().sysname == "Darwin":
            mem_mb = rusage.ru_maxrss / (1024.0 * 1024.0)
        else:
            mem_mb = rusage.ru_maxrss / 1024.0

    # CPU load average (1-minute)
    cpu_load = 0.0
    try:
        cpu_load = os.getloadavg()[0]
    except Exception:
        pass

    return {
        "memory_usage_mb": round(mem_mb, 2),
        "cpu_usage": round(cpu_load, 2),
        "uptime_seconds": uptime
    }
