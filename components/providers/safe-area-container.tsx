import type { SafeAreaInsets } from "@/types";

interface SafeAreaContainerProps {
  children: React.ReactNode;
  insets?: SafeAreaInsets;
}

const background = "#020617";

export const SafeAreaContainer = ({
  children,
  insets,
}: SafeAreaContainerProps) => (
  <main
    style={{
      marginTop: insets?.top ?? 0,
      marginBottom: insets?.bottom ?? 0,
      marginLeft: insets?.left ?? 0,
      marginRight: insets?.right ?? 0,
      background: background,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    {children}
  </main>
);
