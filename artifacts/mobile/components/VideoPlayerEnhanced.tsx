import { Feather } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import * as Haptics from "expo-haptics";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  StatusBar,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useColors } from "@/hooks/useColors";
import { PlaybackSpeedSelector } from "./PlaybackSpeedSelector";
import { router } from "expo-router";

const devLog = (...args: any[]) => {
  if (__DEV__) console.log(...args);
};
const devError = (...args: any[]) => {
  if (__DEV__) console.error(...args);
};

interface VideoPlayerProps {
  videoUrl: string;
  initialTime?: number;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
  onAuthError?: () => void;
  showAuthPrompt?: boolean;
  onAuthPromptDismiss?: () => void;
}

export function VideoPlayerEnhanced({
  videoUrl,
  initialTime = 0,
  onProgressUpdate,
  onComplete,
  onLoadingStateChange,
  showAuthPrompt = false,
  onAuthPromptDismiss,
}: VideoPlayerProps) {
  const colors = useColors();
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [lastStatus, setLastStatus] = useState<string>("");
  const [videoError, setVideoError] = useState(false);
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FIX: Dynamic dimensions that update on orientation change
  const [screenDims, setScreenDims] = useState(Dimensions.get("window"));

  const isMounted = useRef(true);
  const hasEmittedComplete = useRef(false);
  const lastSaveTime = useRef(0);
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoContainerRef = useRef<any>(null);

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.muted = false;
    // Only restore if meaningful progress (>30s to avoid demo artifacts)
    if (initialTime > 30) {
      player.currentTime = initialTime;
    }
  });

  // Keep track of mounted state
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Pause player explicitly on unmount / when player instance changes
  useEffect(() => {
    return () => {
      try {
        if (player) {
          player.pause();
        }
      } catch (err) {
        devLog("[VideoPlayer] Cleanup pause ignored:", err);
      }
    };
  }, [player]);

  // FIX: Listen for dimension changes (fires when device rotates)
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      if (isMounted.current) {
        setScreenDims(window);
      }
    });
    return () => subscription.remove();
  }, []);

  // FIX: Lock to portrait on mount, unlock on unmount
  useEffect(() => {
    if (Platform.OS !== "web") {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).catch(() => {});
    }
    return () => {
      if (Platform.OS !== "web") {
        ScreenOrientation.unlockAsync().catch(() => {});
      }
    };
  }, []);

  // Debug video URL on mount
  useEffect(() => {
    devLog("[VideoPlayer] Initializing with URL:", videoUrl);
    devLog("[VideoPlayer] Initial time:", initialTime);
  }, []);

  // Auto-hide controls after delay when playing
  const showControlsWithTimer = () => {
    if (!isMounted.current) return;
    setShowControls(true);
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();

    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }

    if (isPlaying) {
      hideTimer.current = setTimeout(() => {
        if (!isMounted.current) return;
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          if (isMounted.current) {
            setShowControls(false);
          }
        });
      }, 3000);
    }
  };

  useEffect(() => {
    if (!player) return;

    const playingInterval = setInterval(() => {
      try {
        if (!isMounted.current || !player) {
          clearInterval(playingInterval);
          return;
        }

        const playing = player.playing;
        const currentT = player.currentTime;
        const durationT = player.duration;
        const status = player.status;

        setIsPlaying(playing);
        setCurrentTime(currentT);
        setDuration(durationT);

        const loading = status === "loading";
        setIsLoading(loading);
        onLoadingStateChange?.(loading);

        if (!loading) {
          if (loadingTimer.current) {
            clearTimeout(loadingTimer.current);
            loadingTimer.current = null;
          }
          if (isMounted.current) setLoadingTooLong(false);
        }

        if (status !== lastStatus) {
          if (status === "readyToPlay" || status === "idle") {
            devLog(
              "[VideoPlayer] Video ready - Status:",
              status,
              "Duration:",
              durationT
            );
            if (isMounted.current) setVideoError(false);
          }
          if (status === "error") {
            devError("[VideoPlayer] Video error detected");
            if (isMounted.current) setVideoError(true);
          }
          if (status === "loading" && !loadingTimer.current) {
            loadingTimer.current = setTimeout(() => {
              if (isMounted.current) setLoadingTooLong(true);
            }, 15000);
          }
          setLastStatus(status);
        }

        // Save progress every 5 seconds
        const now = Date.now();
        if (playing && now - lastSaveTime.current >= 5000) {
          onProgressUpdate?.(currentT, durationT);
          lastSaveTime.current = now;
        }

        // Check completion threshold (90%)
        const percentage = durationT > 0 ? (currentT / durationT) * 100 : 0;
        if (percentage >= 90 && !hasEmittedComplete.current) {
          onComplete?.();
          hasEmittedComplete.current = true;
        }
      } catch (err) {
        devLog("[VideoPlayer] Player accessed after release / during unmount, ignoring:", err);
        clearInterval(playingInterval);
      }
    }, 100);

    return () => {
      clearInterval(playingInterval);
    };
  }, [player, onProgressUpdate, onComplete, onLoadingStateChange]);

  // Auto-hide effect
  useEffect(() => {
    showControlsWithTimer();
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (loadingTimer.current) clearTimeout(loadingTimer.current);
    };
  }, []);

  // Listen for fullscreen changes (web platform)
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleFullscreenChange = () => {
      if (!isMounted.current) return;
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      if (isCurrentlyFullscreen !== isFullscreen) {
        setIsFullscreen(isCurrentlyFullscreen);
        devLog(
          "[VideoPlayer] Fullscreen state changed:",
          isCurrentlyFullscreen
        );
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, [isFullscreen]);

  const togglePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isMounted.current || !player) return;

    try {
      const isAtEnd = duration > 0 && currentTime >= duration - 0.5;

      if (isPlaying) {
        player.pause();
      } else {
        if (isAtEnd) {
          player.currentTime = 0;
          hasEmittedComplete.current = false;
        }
        player.play();
      }
      showControlsWithTimer();
    } catch (err) {
      devError("[VideoPlayer] Failed togglePlayPause:", err);
    }
  };

  const skipForward = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isMounted.current || !player) return;
    if (!duration || duration <= 0 || !isFinite(duration)) return;

    try {
      const newTime = Math.min(duration, currentTime + 15);
      if (isFinite(newTime)) {
        player.currentTime = newTime;
      }
      showControlsWithTimer();
    } catch (err) {
      devError("[VideoPlayer] Failed skipForward:", err);
    }
  };

  const skipBackward = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isMounted.current || !player) return;

    try {
      const newTime = Math.max(0, currentTime - 15);
      if (isFinite(newTime)) {
        player.currentTime = newTime;
      }
      showControlsWithTimer();
    } catch (err) {
      devError("[VideoPlayer] Failed skipBackward:", err);
    }
  };

  const handleSpeedChange = async (speed: number) => {
    if (!isMounted.current || !player) return;
    try {
      player.playbackRate = speed;
      setPlaybackSpeed(speed);
      showControlsWithTimer();
      devLog("[VideoPlayer] Playback speed changed to:", speed);
    } catch (error) {
      devError("[VideoPlayer] Failed to change playback speed:", error);
    }
  };

  const handleSliderChange = (value: number) => {
    if (!isMounted.current || !player) return;
    if (!duration || duration <= 0 || !isFinite(duration)) {
      devLog("[VideoPlayer] Cannot seek - invalid duration:", duration);
      return;
    }

    try {
      const newTime = value;
      if (isFinite(newTime) && newTime >= 0) {
        player.currentTime = newTime;
      } else {
        devLog("[VideoPlayer] Invalid seek time calculated:", newTime);
      }
    } catch (err) {
      devError("[VideoPlayer] Failed handleSliderChange:", err);
    }
  };

  const handleSliderStart = () => {
    // Show controls when starting to drag
    showControlsWithTimer();
  };

  const handleSliderComplete = async () => {
    // Haptic feedback when done dragging
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showControlsWithTimer();
  };

  const toggleFullscreen = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (Platform.OS === "web") {
        if (!isFullscreen) {
          const element = videoContainerRef.current as any;
          if (element?.requestFullscreen) {
            await element.requestFullscreen();
            setIsFullscreen(true);
          } else if (element?.webkitRequestFullscreen) {
            await element.webkitRequestFullscreen();
            setIsFullscreen(true);
          }
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
            setIsFullscreen(false);
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
            setIsFullscreen(false);
          }
        }
      } else {
        // FIX: Show modal FIRST then rotate when entering,
        //      rotate back FIRST then hide modal when exiting
        if (!isFullscreen) {
          setIsFullscreen(true);
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE
          );
          devLog("[VideoPlayer] Entered fullscreen - landscape mode");
        } else {
          await ScreenOrientation.unlockAsync();
          setIsFullscreen(false);
          devLog("[VideoPlayer] Exited fullscreen - orientation unlocked");
        }
      }
    } catch (error) {
      devError("[VideoPlayer] Fullscreen toggle failed:", error);
      setIsFullscreen(!isFullscreen);
    }
    showControlsWithTimer();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleRetry = () => {
    if (!player) return;
    setVideoError(false);
    setLoadingTooLong(false);
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    loadingTimer.current = null;
    try {
      player.replace(videoUrl);
    } catch (err) {
      devError("[VideoPlayer] Retry failed:", err);
    }
  };

  const renderVideoControls = () => (
    <>
      {/* Auth Prompt Overlay */}
      {showAuthPrompt && (
        <View style={styles.errorOverlay}>
          <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
            <Feather name="lock" size={28} color="#F59E0B" style={{ marginBottom: 8 }} />
            <Text style={[styles.errorTitle, { color: colors.foreground }]}>Session Expired</Text>
            <Text style={[styles.errorMessage, { color: colors.mutedForeground }]}>
              Your session expired. Please sign in again to continue saving progress.
            </Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={() => { onAuthPromptDismiss?.(); router.replace("/(auth)/login"); }}
            >
              <Text style={styles.retryButtonText}>Sign In Again</Text>
            </Pressable>
            <Pressable onPress={onAuthPromptDismiss} style={styles.dismissButton}>
              <Text style={[styles.dismissText, { color: colors.mutedForeground }]}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Video Error Overlay */}
      {videoError && !showAuthPrompt && (
        <View style={styles.errorOverlay}>
          <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
            <Feather name="alert-circle" size={28} color="#DC2626" style={{ marginBottom: 8 }} />
            <Text style={[styles.errorTitle, { color: colors.foreground }]}>Playback Error</Text>
            <Text style={[styles.errorMessage, { color: colors.mutedForeground }]}>
              Something went wrong while loading the video.
            </Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={handleRetry}
            >
              <Feather name="refresh-cw" size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Loading Too Long Overlay */}
      {loadingTooLong && !videoError && !showAuthPrompt && (
        <View style={styles.errorOverlay}>
          <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
            <Feather name="wifi-off" size={28} color="#F59E0B" style={{ marginBottom: 8 }} />
            <Text style={[styles.errorTitle, { color: colors.foreground }]}>Check your connection</Text>
            <Text style={[styles.errorMessage, { color: colors.mutedForeground }]}>
              The video is taking too long to load.
            </Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={handleRetry}
            >
              <Feather name="refresh-cw" size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Loading Overlay — only shown when not timed out */}
      {isLoading && !loadingTooLong && !videoError && (
        <View style={styles.loadingOverlay}>
          <View
            style={[styles.loadingContainer, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.loadingText, { color: colors.foreground }]}>
              Please wait...
            </Text>
          </View>
        </View>
      )}

      {/* Controls Overlay */}
      <Animated.View
        style={[styles.controlsOverlay, { opacity: overlayOpacity }]}
        pointerEvents={showControls ? "auto" : "none"}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="chevron-down" size={24} color="#FFF" />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={toggleFullscreen} style={styles.iconButton}>
            <Feather
              name={isFullscreen ? "minimize-2" : "maximize-2"}
              size={20}
              color="#FFF"
            />
          </Pressable>
        </View>

        {/* Center Controls */}
        <View style={styles.centerControls}>
          <Pressable onPress={skipBackward} style={styles.skipButton}>
            <Feather name="rotate-ccw" size={24} color="#FFF" />
            <Text style={styles.skipLabel}>15s</Text>
          </Pressable>

          <Pressable
            onPress={togglePlayPause}
            style={styles.playButton}
          >
            <Feather
              name={isPlaying ? "pause" : "play"}
              size={40}
              color="#FFF"
              style={{ marginLeft: isPlaying ? 0 : 4 }}
            />
          </Pressable>

          <Pressable onPress={skipForward} style={styles.skipButton}>
            <Feather name="rotate-cw" size={24} color="#FFF" />
            <Text style={styles.skipLabel}>15s</Text>
          </Pressable>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          {/* Progress Bar - Now draggable slider */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

            <Slider
              style={styles.progressSlider}
              value={currentTime}
              minimumValue={0}
              maximumValue={duration || 1}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor="#FFFFFF"
              onValueChange={handleSliderChange}
              onSlidingStart={handleSliderStart}
              onSlidingComplete={handleSliderComplete}
            />

            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlButtons}>
            <PlaybackSpeedSelector
              currentSpeed={playbackSpeed}
              onSpeedChange={handleSpeedChange}
            />
          </View>
        </View>
      </Animated.View>
    </>
  );

  return (
    <>
      {/* Normal View */}
      <View style={styles.container}>
        <Pressable
          ref={videoContainerRef}
          style={styles.videoContainer}
          onPress={showControlsWithTimer}
        >
          <VideoView
            player={player}
            style={styles.video}
            nativeControls={false}
            contentFit="cover"
            allowsPictureInPicture={false}
          />
          {renderVideoControls()}
        </Pressable>
      </View>

      {/* Fullscreen Modal (Native only) */}
      {Platform.OS !== "web" && (
        <Modal
          visible={isFullscreen}
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={toggleFullscreen}
          supportedOrientations={[
            "landscape",
            "landscape-left",
            "landscape-right",
            "portrait",
          ]}
        >
          <StatusBar hidden={true} translucent={true} />
          <View style={styles.fullscreenContainer}>
            <Pressable
              style={styles.fullscreenVideoContainer}
              onPress={showControlsWithTimer}
            >
              <VideoView
                player={player}
                style={styles.fullscreenVideo}
                nativeControls={false}
                contentFit="cover"
                allowsPictureInPicture={false}
              />
              {renderVideoControls()}
            </Pressable>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    position: "relative",
    overflow: "visible",
  },
  videoContainer: {
    flex: 1,
    position: "relative",
    overflow: "visible",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  // FIX: flex-based sizing instead of hardcoded Dimensions px values
  fullscreenVideoContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "relative",
  },
  fullscreenVideo: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    padding: 24,
  },
  errorContainer: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  dismissButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dismissText: {
    fontSize: 13,
    fontWeight: "600",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  centerControls: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  playButton: {
    width: 60,
    height: 60,
    backgroundColor: "transparent",
    borderWidth: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  skipButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  skipLabel: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  bottomBar: {
    padding: 12,
    gap: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
    minWidth: 40,
    textAlign: "center",
  },
  progressSlider: {
    flex: 1,
    height: 40,
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
