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

interface VideoPlayerProps {
  videoUrl: string;
  initialTime?: number;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

export function VideoPlayerEnhanced({
  videoUrl,
  initialTime = 0,
  onProgressUpdate,
  onComplete,
  onLoadingStateChange,
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

  // FIX: Dynamic dimensions that update on orientation change
  const [screenDims, setScreenDims] = useState(Dimensions.get("window"));

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

  // FIX: Listen for dimension changes (fires when device rotates)
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDims(window);
    });
    return () => subscription.remove();
  }, []);

  // Debug video URL on mount
  useEffect(() => {
    console.log("[VideoPlayer] Initializing with URL:", videoUrl);
    console.log("[VideoPlayer] Initial time:", initialTime);
  }, []);

  // Auto-hide controls after 3 seconds
  const showControlsWithTimer = () => {
    setShowControls(true);
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }

    hideTimer.current = setTimeout(() => {
      if (isPlaying) {
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowControls(false);
        });
      }
    }, 3000);
  };

  useEffect(() => {
    if (!player) return;

    const playingInterval = setInterval(() => {
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

      if (status !== lastStatus) {
        if (status === "readyToPlay" || status === "idle") {
          console.log(
            "[VideoPlayer] Video ready - Status:",
            status,
            "Duration:",
            durationT
          );
        }
        if (status === "error") {
          console.error("[VideoPlayer] Video error detected");
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
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  // Listen for fullscreen changes (web platform)
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      if (isCurrentlyFullscreen !== isFullscreen) {
        setIsFullscreen(isCurrentlyFullscreen);
        console.log(
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
  };

  const skipForward = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!duration || duration <= 0 || !isFinite(duration)) return;
    const newTime = Math.min(duration, currentTime + 10);
    if (isFinite(newTime)) {
      player.currentTime = newTime;
    }
    showControlsWithTimer();
  };

  const skipBackward = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTime = Math.max(0, currentTime - 10);
    if (isFinite(newTime)) {
      player.currentTime = newTime;
    }
    showControlsWithTimer();
  };

  const handleSpeedChange = async (speed: number) => {
    try {
      player.playbackRate = speed;
      setPlaybackSpeed(speed);
      showControlsWithTimer();
      console.log("[VideoPlayer] Playback speed changed to:", speed);
    } catch (error) {
      console.error("[VideoPlayer] Failed to change playback speed:", error);
    }
  };

  const handleSliderChange = (value: number) => {
    if (!duration || duration <= 0 || !isFinite(duration)) {
      console.warn("[VideoPlayer] Cannot seek - invalid duration:", duration);
      return;
    }

    const newTime = value;
    if (isFinite(newTime) && newTime >= 0) {
      player.currentTime = newTime;
    } else {
      console.warn("[VideoPlayer] Invalid seek time calculated:", newTime);
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
          console.log("[VideoPlayer] Entered fullscreen - landscape mode");
        } else {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP
          );
          setIsFullscreen(false);
          console.log("[VideoPlayer] Exited fullscreen - portrait mode");
        }
      }
    } catch (error) {
      console.error("[VideoPlayer] Fullscreen toggle failed:", error);
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

  const renderVideoControls = () => (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View
            style={[styles.loadingContainer, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.loadingText, { color: colors.foreground }]}>
              Loading Lesson...
            </Text>
            <Text
              style={[
                styles.debugText,
                { color: colors.mutedForeground, marginTop: 4 },
              ]}
            >
              {player?.status || "initializing"}
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
          <View style={{ flex: 1 }} />
          <Pressable onPress={toggleFullscreen} style={styles.iconButton}>
            <Feather
              name={isFullscreen ? "minimize" : "maximize"}
              size={20}
              color="#FFF"
            />
          </Pressable>
        </View>

        {/* Center Controls */}
        <View style={styles.centerControls}>
          <Pressable onPress={skipBackward} style={styles.skipButton}>
            <Feather name="rotate-ccw" size={24} color="#FFF" />
            <Text style={styles.skipLabel}>10s</Text>
          </Pressable>

          <Pressable
            onPress={togglePlayPause}
            style={[
              styles.playButton,
              { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
          >
            <Feather
              name={isPlaying ? "pause" : "play"}
              size={32}
              color="#FFF"
            />
          </Pressable>

          <Pressable onPress={skipForward} style={styles.skipButton}>
            <Feather name="rotate-cw" size={24} color="#FFF" />
            <Text style={styles.skipLabel}>10s</Text>
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
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor={colors.primary}
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

            <Pressable onPress={togglePlayPause} style={styles.iconButton}>
              <Feather
                name={isPlaying ? "pause" : "play"}
                size={20}
                color="#FFF"
              />
            </Pressable>
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
  },
  videoContainer: {
    flex: 1,
    position: "relative",
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
  debugText: {
    fontSize: 11,
    textAlign: "center",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
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
