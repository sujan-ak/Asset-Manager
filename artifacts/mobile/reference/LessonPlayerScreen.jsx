/**
 * LessonPlayerScreen.jsx
 *
 * ANDROID FIXES:
 *   1. Fullscreen  → presentFullscreenPlayer() is broken on Android expo-av.
 *                    Instead: lock orientation to landscape + expand video to
 *                    fill full screen using position:absolute + Dimensions.
 *                    This is the correct approach for Android.
 *
 *   2. Duplicate buttons → Only 3 center controls: ↺10s | Play/Pause | ↻10s
 *                          No skip-track (|◀ ▶|) buttons at all.
 *
 *   3. Progress bar seek → pixel-based widths via onLayout (no % strings)
 *
 *   4. gap removed → marginHorizontal/marginRight used instead (RN compat)
 *
 * INSTALL (run once):
 *   npx expo install expo-av expo-screen-orientation expo-haptics
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Haptics from 'expo-haptics';

// ─── CONSTANTS ───────────────────────────────────────────────
const getWindow = () => Dimensions.get('window');

const BRAND   = '#6C63FF';
const DARK    = '#0F172A';
const TEXT    = '#1E293B';
const MUTED   = '#94A3B8';
const SURFACE = '#F8FAFC';
const DONE_BG = '#E1F5EE';
const DONE_FG = '#1D9E75';
const ACT_BG  = '#F5F3FF';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// ─── MOCK DATA ───────────────────────────────────────────────
const COURSE_TITLE = 'Robotics for Beginners';
const VIDEO_URL    = 'https://www.w3schools.com/html/mov_bbb.mp4';

const INITIAL_LESSONS = [
  { id: 1, title: 'Introduction to Robotics',  dur: '45 min', locked: false, done: true  },
  { id: 2, title: 'Understanding Circuits',     dur: '1h 10m', locked: false, done: false },
  { id: 3, title: 'Arduino Programming Basics', dur: '1h 30m', locked: false, done: false },
  { id: 4, title: 'Sensor Integration',         dur: '55 min', locked: true,  done: false },
  { id: 5, title: 'Building Your First Robot',  dur: '2h 0m',  locked: true,  done: false },
];

// ─── HELPERS ─────────────────────────────────────────────────
const fmt = (ms) => {
  const s   = Math.floor((ms || 0) / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function LessonPlayerScreen({ navigation }) {
  const videoRef       = useRef(null);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const hideTimer      = useRef(null);

  // Window dimensions — update on rotate
  const [winW, setWinW] = useState(getWindow().width);
  const [winH, setWinH] = useState(getWindow().height);

  // Track pixel width for seek bar
  const [trackWidth, setTrackWidth] = useState(1);

  const [status,       setStatus]       = useState({});
  const [speed,        setSpeed]        = useState(1);
  const [showSpeed,    setShowSpeed]    = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLesson, setActiveLesson] = useState(2);
  const [lessons]                       = useState(INITIAL_LESSONS);
  const [activeTab,    setActiveTab]    = useState('content');

  const isPlaying = status.isPlaying       || false;
  const duration  = status.durationMillis  || 0;
  const position  = status.positionMillis  || 0;
  const progress  = duration > 0 ? position / duration : 0;
  const thumbLeft = Math.max(0, progress * trackWidth - 6);

  // Portrait video dimensions
  const portraitVideoH = winW * (9 / 16);

  // ── Listen for dimension changes (rotation) ─────────────────
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setWinW(window.width);
      setWinH(window.height);
    });
    return () => sub?.remove();
  }, []);

  // ── Auto-hide controls ──────────────────────────────────────
  const showControls = useCallback(() => {
    Animated.timing(overlayOpacity, {
      toValue: 1, duration: 200, useNativeDriver: true,
    }).start();
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (isPlaying) {
        Animated.timing(overlayOpacity, {
          toValue: 0, duration: 400, useNativeDriver: true,
        }).start();
      }
    }, 3000);
  }, [isPlaying, overlayOpacity]);

  useEffect(() => { showControls(); }, [isPlaying]);
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  // ─── PLAY / PAUSE ────────────────────────────────────────
  const togglePlay = async () => {
    if (!videoRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) await videoRef.current.pauseAsync();
    else           await videoRef.current.playAsync();
    showControls();
  };

  // ─── SKIP ────────────────────────────────────────────────
  const skip = async (ms) => {
    if (!videoRef.current) return;
    const next = Math.max(0, Math.min(duration, position + ms));
    await videoRef.current.setPositionAsync(next);
    showControls();
  };

  // ─── SEEK ────────────────────────────────────────────────
  const onProgressBarPress = (e) => {
    if (!videoRef.current || !duration || trackWidth <= 1) return;
    const pct = Math.max(0, Math.min(1, e.nativeEvent.locationX / trackWidth));
    videoRef.current.setPositionAsync(pct * duration);
    showControls();
  };

  // ─── SPEED ───────────────────────────────────────────────
  const changeSpeed = async (s) => {
    if (!videoRef.current) return;
    await videoRef.current.setRateAsync(s, true);
    setSpeed(s);
    setShowSpeed(false);
  };

  // ─── FULLSCREEN — ANDROID FIX ────────────────────────────
  // presentFullscreenPlayer() does NOT work reliably on Android.
  // Correct approach: lock orientation to landscape and expand
  // the video container to fill the entire screen using
  // position:'absolute' with the rotated window dimensions.
  // Pressing the button again restores portrait + normal layout.
  const toggleFullscreen = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (!isFullscreen) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE_LEFT,
        );
        setIsFullscreen(true);
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        );
        setIsFullscreen(false);
      }
    } catch (e) {
      // If ScreenOrientation fails (e.g. Expo Go limitations),
      // still toggle the layout so UI responds
      setIsFullscreen((v) => !v);
    }
    showControls();
  };

  // ─── OPEN LESSON ─────────────────────────────────────────
  const openLesson = async (lesson) => {
    if (lesson.locked) return;
    setActiveLesson(lesson.id);
    if (videoRef.current) {
      await videoRef.current.stopAsync();
      await videoRef.current.setPositionAsync(0);
    }
    showControls();
  };

  // ─────────────────────────────────────────────────────────
  // VIDEO CONTAINER STYLE:
  // Normal   → width: winW, height: winW * 9/16 (inline 16:9)
  // Fullscreen → position:'absolute', cover full window (landscape)
  //              zIndex:999 so it floats above everything
  const videoContainerStyle = isFullscreen
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: winW,
        height: winH,
        backgroundColor: DARK,
        zIndex: 999,
      }
    : {
        width: winW,
        height: portraitVideoH,
        backgroundColor: DARK,
      };

  // ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle={isFullscreen ? 'light-content' : 'dark-content'}
        backgroundColor={isFullscreen ? DARK : '#fff'}
      />

      {/* ── HEADER (hidden in fullscreen) ── */}
      {!isFullscreen && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backIco}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {COURSE_TITLE}
          </Text>
          <View style={{ width: 36 }} />
        </View>
      )}

      {/* ── VIDEO PLAYER ── */}
      <TouchableWithoutFeedback onPress={showControls}>
        <View style={videoContainerStyle}>

          <Video
            ref={videoRef}
            source={{ uri: VIDEO_URL }}
            style={{ width: '100%', height: '100%' }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping={false}
            useNativeControls={false}
            onPlaybackStatusUpdate={setStatus}
            progressUpdateIntervalMillis={500}
          />

          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>

            {/*
              CENTER ROW — ONLY 3 BUTTONS:
              ↺10s  |  Play/Pause  |  ↻10s
              NO skip-track buttons (|◀ ▶|) — those are removed.
            */}
            <View style={styles.centerRow}>
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => skip(-10000)}
                activeOpacity={0.7}
              >
                <Text style={styles.skipSymbol}>↺</Text>
                <Text style={styles.skipLabel}>10s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.playBig}
                onPress={togglePlay}
                activeOpacity={0.8}
              >
                <Text style={styles.playIco}>{isPlaying ? '⏸' : '▶'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => skip(10000)}
                activeOpacity={0.7}
              >
                <Text style={styles.skipSymbol}>↻</Text>
                <Text style={styles.skipLabel}>10s</Text>
              </TouchableOpacity>
            </View>

            {/* ── BOTTOM BAR ── */}
            <View style={styles.bottomBar}>

              {/* Progress scrubber */}
              <View style={styles.scrubRow}>
                <Text style={styles.timeText}>{fmt(position)}</Text>

                <TouchableWithoutFeedback onPress={onProgressBarPress}>
                  <View
                    style={styles.trackOuter}
                    onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                  >
                    {/* Buffer */}
                    <View
                      style={[
                        styles.trackFill,
                        {
                          width:
                            ((status.playableDurationMillis || 0) /
                              (duration || 1)) * trackWidth,
                          backgroundColor: 'rgba(255,255,255,0.25)',
                        },
                      ]}
                    />
                    {/* Progress */}
                    <View
                      style={[
                        styles.trackFill,
                        { width: progress * trackWidth, backgroundColor: BRAND },
                      ]}
                    />
                    {/* Thumb — pixel left, not % string */}
                    <View style={[styles.thumb, { left: thumbLeft }]} />
                  </View>
                </TouchableWithoutFeedback>

                <Text style={styles.timeText}>{fmt(duration)}</Text>
              </View>

              {/* Controls row */}
              <View style={styles.ctrlRow}>

                {/* Speed */}
                <TouchableOpacity
                  style={styles.speedBtn}
                  onPress={() => setShowSpeed((v) => !v)}
                >
                  <Text style={styles.speedBtnTxt}>{speed}×</Text>
                </TouchableOpacity>

                {showSpeed && (
                  <View style={styles.speedMenu}>
                    {SPEEDS.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={styles.speedOpt}
                        onPress={() => changeSpeed(s)}
                      >
                        <Text
                          style={[
                            styles.speedOptTxt,
                            s === speed && styles.speedOptActive,
                          ]}
                        >
                          {s}×
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View style={{ flex: 1 }} />

                {/*
                  FULLSCREEN BUTTON — Android fix:
                  Tapping this locks orientation to landscape and expands
                  the video to position:absolute filling the screen.
                  No presentFullscreenPlayer() used (broken on Android).
                */}
                <TouchableOpacity
                  style={styles.ctrlBtn}
                  onPress={toggleFullscreen}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ctrlIco}>
                    {isFullscreen ? '✕' : '⛶'}
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      {/* ── REST OF SCREEN (hidden in fullscreen) ── */}
      {!isFullscreen && (
        <>
          {/* Tabs */}
          <View style={styles.tabs}>
            {['content', 'resources'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, activeTab === t && styles.tabActive]}
                onPress={() => setActiveTab(t)}
              >
                <Text
                  style={[
                    styles.tabTxt,
                    activeTab === t && styles.tabTxtActive,
                  ]}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Lesson list */}
          {activeTab === 'content' ? (
            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {lessons.map((lesson, i) => {
                const isActive = lesson.id === activeLesson;
                const isDone   = lesson.done;
                const isLocked = lesson.locked;
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[
                      styles.lessonRow,
                      isActive && styles.lessonRowActive,
                      isLocked && { opacity: 0.5 },
                    ]}
                    onPress={() => openLesson(lesson)}
                    disabled={isLocked}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.lessonNum,
                        isDone   && { backgroundColor: DONE_BG, borderWidth: 0 },
                        isActive && { backgroundColor: ACT_BG,  borderWidth: 0 },
                      ]}
                    >
                      {isDone ? (
                        <Text style={{ color: DONE_FG, fontSize: 14, fontWeight: '700' }}>✓</Text>
                      ) : isLocked ? (
                        <Text style={{ fontSize: 13 }}>🔒</Text>
                      ) : (
                        <Text style={[styles.lessonNumTxt, isActive && { color: BRAND }]}>
                          {i + 1}
                        </Text>
                      )}
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text
                        style={[
                          styles.lessonTitle,
                          isDone   && { textDecorationLine: 'line-through', color: MUTED },
                          isActive && { color: '#1E1B4B', fontWeight: '600' },
                          isLocked && { color: '#CBD5E1' },
                        ]}
                        numberOfLines={1}
                      >
                        {lesson.title}
                      </Text>
                      <Text style={styles.lessonDur}>{lesson.dur}</Text>
                    </View>
                    {isActive && (
                      <Text style={{ color: BRAND, fontSize: 14 }}>▶</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyTab}>
              <Text style={styles.emptyTxt}>
                No resources attached to this lesson yet.
              </Text>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIco: { fontSize: 26, color: TEXT, lineHeight: 32, marginTop: -2 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
    marginHorizontal: 8,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },

  // Center row — 3 buttons only, no gap property
  centerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBig: {
    width: 58, height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 28,
  },
  playIco:    { color: '#fff', fontSize: 22, marginLeft: 2 },
  skipBtn:    { alignItems: 'center', justifyContent: 'center', padding: 8 },
  skipSymbol: { color: '#fff', fontSize: 26 },
  skipLabel:  { color: '#fff', fontSize: 10, fontWeight: '600', marginTop: -2 },

  bottomBar: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  scrubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    minWidth: 36,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  trackOuter: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 4,
  },
  thumb: {
    position: 'absolute',
    width: 13, height: 13,
    borderRadius: 7,
    backgroundColor: BRAND,
    borderWidth: 2,
    borderColor: '#fff',
    top: -4.5,
  },

  ctrlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ctrlBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  ctrlIco: { color: '#fff', fontSize: 18 },

  speedBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  speedBtnTxt:    { color: '#fff', fontSize: 11, fontWeight: '600' },
  speedMenu: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    backgroundColor: 'rgba(15,23,42,0.96)',
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 70,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 99,
    elevation: 10,
  },
  speedOpt:       { paddingVertical: 8, paddingHorizontal: 14 },
  speedOptTxt:    { color: '#fff', fontSize: 12, textAlign: 'center' },
  speedOptActive: { color: BRAND, fontWeight: '700' },

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
    marginBottom: -1.5,
  },
  tabActive:    { borderBottomColor: BRAND },
  tabTxt:       { fontSize: 13, fontWeight: '500', color: MUTED },
  tabTxtActive: { color: BRAND },

  scroll: { flex: 1, backgroundColor: '#fff' },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 12,
  },
  lessonRowActive: { backgroundColor: ACT_BG },
  lessonNum: {
    width: 32, height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 12,
  },
  lessonNumTxt: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  lessonInfo:   { flex: 1 },
  lessonTitle:  { fontSize: 13, fontWeight: '500', color: TEXT, lineHeight: 18 },
  lessonDur:    { fontSize: 11, color: MUTED, marginTop: 2 },

  emptyTab: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTxt: { color: MUTED, fontSize: 14, textAlign: 'center' },
});
