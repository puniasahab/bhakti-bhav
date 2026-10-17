import DevotionalHeader from "./DevotionalHeader";

export default function VratKathaHeader(props) {
  return <DevotionalHeader {...props} fallbackRoute="/vrat-katha" pageName={{ hi: "व्रत कथा", en: "Vrat Katha" }} />;
}
