import { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { colors } from "@/core/theme/colors";
import { spacing } from "@/core/theme/spacing";
import { createSignature, type SignaturePoint } from "./signature";


type SignaturePadProps = {
  onChange: (signatureBase64: string | null) => void;
};

export function SignaturePad({ onChange }: SignaturePadProps) {
  const [points, setPoints] = useState<SignaturePoint[]>([]);
  const [width, setWidth] = useState(320);
  const pointsRef = useRef<SignaturePoint[]>([]);

  function updatePoint(event: GestureResponderEvent, start: boolean) {
    const point = {
      x: event.nativeEvent.locationX,
      y: event.nativeEvent.locationY,
      start,
    };
    const nextPoints = [...pointsRef.current, point];
    pointsRef.current = nextPoints;
    setPoints(nextPoints);
    onChange(createSignature(nextPoints, width));
  }

  function clear() {
    pointsRef.current = [];
    setPoints([]);
    onChange(null);
  }

  return (
    <View>
      <View
        style={styles.pad}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={(event) => updatePoint(event, true)}
        onResponderMove={(event) => updatePoint(event, false)}
      >
        {points.slice(1).map((point, index) => {
          if (point.start) return null;
          const previous = points[index];
          const dx = point.x - previous.x;
          const dy = point.y - previous.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = `${Math.atan2(dy, dx)}rad`;
          return (
            <View
              pointerEvents="none"
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
          <Text pointerEvents="none" style={styles.hint}>Signez ici avec votre doigt ou un stylet</Text>
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
