import { Replayer } from '@rrweb/replay';
import '@rrweb/replay/dist/style.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Recording, Viewport } from '@/modules/sessions/utils/replay';

export interface Player{
    ready: boolean;
    mount: (element: HTMLDivElement | null) => void;
    viewport: Viewport;
    time: number;
    total: number;
    playing: boolean;
    skipping: boolean;
    speed: number;
    skipInactive: boolean;
    toggle: () => void;
    seek: (ms: number) => void;
    setSpeed: (speed: number) => void;
    setSkipInactive: (skip: boolean) => void;
}

const FALLBACK: Viewport = { width: 1280, height: 800 };

export const useReplayer = (recording: Recording | null, from = 0, autoplay = true): Player => {
    const [root, setRoot] = useState<HTMLDivElement | null>(null);
    const instance = useRef<Replayer | null>(null);
    const [viewport, setViewport] = useState(recording?.viewport ?? FALLBACK);
    const [time, setTime] = useState(from);
    const [total, setTotal] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [skipping, setSkipping] = useState(false);
    const [speed, setSpeedState] = useState(1);
    const [skipInactive, setSkipState] = useState(true);
    const settings = useRef({ speed, skipInactive, from, autoplay });

    useEffect(() => {
        settings.current = { speed, skipInactive, from, autoplay };
    });

    useEffect(() => {
        if(root === null || recording === null) return;
        const { speed: initialSpeed, skipInactive: initialSkip, from: offset, autoplay: play } = settings.current;
        const replayer = new Replayer(recording.events as ConstructorParameters<typeof Replayer>[0], {
            root,
            speed: initialSpeed,
            skipInactive: initialSkip,
            mouseTail: false,
            showWarning: false,
            triggerFocus: false
        });
        const length = replayer.getMetaData().totalTime;
        instance.current = replayer;
        setTotal(length);
        setViewport(recording.viewport);
        replayer.on('resize', (size) => setViewport(size as Viewport));
        replayer.on('skip-start', () => setSkipping(true));
        replayer.on('skip-end', () => setSkipping(false));
        replayer.on('finish', () => {
            setPlaying(false);
            setSkipping(false);
            setTime(length);
        });
        const at = Math.min(offset, length);
        if(play){
            replayer.play(at);
        }else{
            replayer.pause(at);
        }
        setPlaying(play);
        setTime(at);
        return () => {
            instance.current = null;
            replayer.destroy();
        };
    }, [root, recording]);

    useEffect(() => {
        if(!playing) return;
        let frame = 0;
        const tick = () => {
            const replayer = instance.current;
            if(replayer) setTime(Math.min(replayer.getCurrentTime(), replayer.getMetaData().totalTime));
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [playing]);

    const seek = useCallback((ms: number) => {
        const replayer = instance.current;
        if(!replayer) return;
        const at = Math.max(0, Math.min(ms, replayer.getMetaData().totalTime));
        if(playing){
            replayer.play(at);
        }else{
            replayer.pause(at);
        }
        setTime(at);
    }, [playing]);

    const toggle = useCallback(() => {
        const replayer = instance.current;
        if(!replayer) return;
        if(playing){
            replayer.pause();
            setTime(replayer.getCurrentTime());
            setPlaying(false);
            return;
        }
        const length = replayer.getMetaData().totalTime;
        const at = time >= length ? 0 : time;
        replayer.play(at);
        setTime(at);
        setPlaying(true);
    }, [playing, time]);

    const setSpeed = useCallback((value: number) => {
        instance.current?.setConfig({ speed: value });
        setSpeedState(value);
    }, []);

    const setSkipInactive = useCallback((value: boolean) => {
        instance.current?.setConfig({ skipInactive: value });
        setSkipState(value);
    }, []);

    return { ready: recording !== null, mount: setRoot, viewport, time, total, playing, skipping, speed, skipInactive, toggle, seek, setSpeed, setSkipInactive };
};
