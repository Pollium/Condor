export interface RemoteRecording{
    enabled: boolean;
    sampleRate: number;
    maskInputs: boolean;
    maskText: boolean;
    blockSelector: string | null;
    captureConsole: boolean;
    captureNetwork: boolean;
}

export interface RemoteConfig{
    projectId: string;
    respectDnt: boolean;
    recording: RemoteRecording;
}
