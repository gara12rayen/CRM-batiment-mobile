import { useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";

type Point = { x: number; y: number };

type SignaturePadProps = {
  onChange: (signatureBase64: string | null) => void;
};

function createSignature(points: Point[]) {
  if (points.length < 2) {
    return null;
  }

  const path = points.map((point, index) => {
    return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
  }).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160"><path d="${path}" fill="none" stroke="#172033" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function SignaturePad({ onChange }: SignaturePadProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const pointsRef = useRef<Point[]>([]);

  const updatePoint = (event: GestureResponderEvent) => {
    const point = {
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY,
    };
    const nextPoints = [...pointsRef.current, point];
    pointsRef.current = nextPoints;
    setPoints(nextPoints);
    onChange(createSignature(nextPoints));
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: updatePoint,
        onPanResponderMove: updatePoint,
      }),
    [],
  );

  function clear() {
    pointsRef.current = [];
    setPoints([]);
    onChange(null);
  }

  return (
    <View>
      <View style={styles.pad} {...responder.panHandlers}>
        {points.slice(1).map((point, index) => {
          const previous = points[index];
          const dx = point.x - previous.x;
          const dy = point.y - previous.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = `${Math.atan2(dy, dx)}rad`;
          return (
            <View
              key={`${index}-${point.x}-${point.y}`}
              style={[
                styles.stroke,
                {
                  left: previous.x,
                  top: previous.y,
                  transform: [{ rotate: angle }],
                  width: length,
                },
              ]}
            />
          );
        })}
        {points.length === 0 && (
          <Text style={styles.hint}>Signez ici avec votre doigt ou un stylet</Text>
        )}
      </View>
      <Text accessibilityRole="button" onPress={clear} style={styles.clear}>
        Effacer la signature
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    backgroundColor: colors.background.soft,
    borderColor: colors.border.DEFAULT,
    borderWidth: 1,
    height: 160,
    overflow: "hidden",
    position: "relative",
  },
  stroke: {
    backgroundColor: colors.text.DEFAULT,
    height: 3,
    position: "absolute",
    transformOrigin: "left center",
  },
  hint: {
    color: colors.text.muted,
    padding: spacing.lg,
    textAlign: "center",
  },
  clear: {
    color: colors.brand[700],
    marginTop: spacing.sm,
    textAlign: "right",
  },
});
