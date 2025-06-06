import React, { useState } from 'react';
import { b64EncodeUnicode } from '../utils/encoding';

interface ShareButtonProps {
  content: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ content }) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async () => {
    const encodedContent = b64EncodeUnicode(content);
    const shareUrl = `${
      window.location.origin
    }/share?content=${encodeURIComponent(encodedContent)}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="icon-button"
      title="Share note"
    >
      {showCopied ? '✓' : '🔗'}
    </button>
  );
}; 