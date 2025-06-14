import React, { useState } from 'react';
import { compressAndEncode } from '../utils/encoding';

interface ShareButtonProps {
  content: string;
  theme: 'light' | 'dark' | 'clean';
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  content,
  theme,
}) => {
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async () => {
    const compressedContent = compressAndEncode(content);
    const shareUrl = `${window.location.origin}/share?content=${compressedContent}&theme=${theme}`;

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