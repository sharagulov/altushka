import { useState } from "react";
import { FiCopy } from "react-icons/fi";
import '../styles/global.scss'
import '../styles/RPstyle.scss'

const ClipboardIcon = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const fallbackCopyText = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  const handleCopy = async () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error("Ошибка копирования через clipboard API", err);
        fallbackCopyText(text);
      }
    } else {
      fallbackCopyText(text);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div onClick={handleCopy} className={`my-icon ${copied ? "clicked" : ""}`}>
      <FiCopy size={15} />
    </div>
  );
};

export default ClipboardIcon;
