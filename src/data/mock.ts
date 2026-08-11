// ─────────────────────────────────────────────────────────
// Robot Savo Copilot — Mock Data Layer
// All values are mock. Real data comes from backend API.
// API plan: GET /robot/status · GET /robot/pose · POST /chat · POST /robot/command
// ─────────────────────────────────────────────────────────

export type RobotMode = 'IDLE' | 'NAVIGATING' | 'FOLLOWING' | 'CHARGING' | 'ERROR';
export type LocalizationStatus = 'LOCALIZED' | 'LOST' | 'INITIALIZING';
export type BackendMode = 'MOCK' | 'LIVE';

export type RobotStatus = {
    online: boolean;
    mode: RobotMode;
    battery: number;
    batteryVoltage: number;
    safetyStop: boolean;
    backendMode: BackendMode;
    uptime: string;
    lastUpdate: string;
};

export type RobotPose = {
    x: number;
    y: number;
    yaw: number;
    frame: 'map' | 'odom' | 'base_link';
    status: LocalizationStatus;
    confidence: number;
    lastUpdate: string;
};

export type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
};

// ── Mock robot state ──────────────────────────────────────

export const MOCK_ROBOT_STATUS: RobotStatus = {
    online: true,
    mode: 'IDLE',
    battery: 82,
    batteryVoltage: 24.8,
    safetyStop: false,
    backendMode: 'MOCK',
    uptime: '04:32:11',
    lastUpdate: '2026-06-26T08:15:00Z',
};

export const MOCK_POSE: RobotPose = {
    x: 2.45,
    y: -1.18,
    yaw: 47.3,
    frame: 'map',
    status: 'LOCALIZED',
    confidence: 0.97,
    lastUpdate: '2026-06-26T08:15:01Z',
};

// ── Chat ─────────────────────────────────────────────────

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
    {
        id: 'sys-1',
        role: 'assistant',
        text: 'Hello! I am Savo AI Assistant. Ask me about Robot Savo 2.0 — hardware, sensors, navigation, safety, or current status.',
        timestamp: new Date().toISOString(),
    },
];

export const CHAT_SUGGESTIONS = [
    'What is Robot Savo?',
    'What sensors does it use?',
    'How does it navigate?',
    'What is the safety system?',
    'Current robot status?',
];

export function getMockChatResponse(question: string): string {
    const q = question.toLowerCase();
    if (q.includes('what is') || (q.includes('savo') && q.length < 20)) {
        return 'Robot Savo 2.0 is an autonomous indoor guide robot for navigation, human interaction, and smart building integration — powered by ROS 2. [MOCK DATA]';
    }
    if (q.includes('sensor')) {
        return '• LiDAR — 2D/3D mapping & obstacle detection\n• RGB-D Camera — depth & object recognition\n• Ultrasonic — close-range avoidance\n• IMU — orientation tracking\n• Wheel encoders — odometry\n[MOCK DATA]';
    }
    if (q.includes('navigat')) {
        return '• ROS 2 Nav2 stack\n• SLAM-based localization\n• A* global path planning\n• DWA local planner\n• Costmap obstacle avoidance\n[MOCK DATA]';
    }
    if (q.includes('safety')) {
        return '• Hardware emergency stop\n• Software safety stop layer\n• Collision detection zones\n• ROS 2 costmap inflation\n• App never directly controls motors — all commands go via backend. [MOCK DATA]';
    }
    if (q.includes('status') || q.includes('battery') || q.includes('current')) {
        return `Mode: ${MOCK_ROBOT_STATUS.mode} | Battery: ${MOCK_ROBOT_STATUS.battery}% | Safety Stop: ${MOCK_ROBOT_STATUS.safetyStop ? 'ACTIVE' : 'OFF'} | Uptime: ${MOCK_ROBOT_STATUS.uptime} [MOCK DATA]`;
    }
    if (q.includes('ai') || q.includes('llm') || q.includes('language')) {
        return 'Savo uses an LLM-based conversational AI. Voice commands are processed via STT → LLM → safe command pipeline. App connects to LLM server at http://SERVER_IP:8000. [MOCK DATA]';
    }
    return "I can answer questions about Robot Savo's hardware, sensors, navigation, safety, and status. What would you like to know? [MOCK DATA]";
}

// ── Voice ─────────────────────────────────────────────────

export const VOICE_EXAMPLE_COMMANDS = [
    'Savo, go to room A201',
    'Savo, stop',
    'Follow me',
    'Where are you now?',
    'What is your battery level?',
];

export function getMockVoiceResponse(text: string): string {
    const t = text.toLowerCase().trim();
    if (!t) return '';
    if (t.includes('stop')) return '[MOCK] Safety stop acknowledged. Robot holding position.';
    if (t.includes('room') || t.includes('go to')) return '[MOCK] Navigation goal queued. Backend will plan path when connected.';
    if (t.includes('follow')) return '[MOCK] Follow-me mode will activate via ROS 2 backend pipeline.';
    if (t.includes('where') || t.includes('position') || t.includes('location')) {
        return `[MOCK] Position: X=${MOCK_POSE.x}m, Y=${MOCK_POSE.y}m, Yaw=${MOCK_POSE.yaw}° (frame: ${MOCK_POSE.frame})`;
    }
    if (t.includes('battery')) {
        return `[MOCK] Battery: ${MOCK_ROBOT_STATUS.battery}% (${MOCK_ROBOT_STATUS.batteryVoltage}V). Status: OK.`;
    }
    return '[MOCK] Command received. Backend will process when connected to ROS 2.';
}

// ── Safety ────────────────────────────────────────────────

// SAFETY RULE: This function will later POST /robot/command { type: "emergency_stop" }
// The ROS 2 backend handles actual motor control. App NEVER directly controls motors.
export function mockEmergencyStop(): void {
    console.warn('[MOCK SAFETY] Emergency stop → will POST /robot/command { type: "emergency_stop" } when backend connected.');
}
