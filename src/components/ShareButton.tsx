import React, { useState } from 'react';
import { compressAndEncode } from '../utils/encoding';
import { IconShare, IconCheck } from './Icons';

interface ShareButtonProps {
  content: string;
  theme: 'light' | 'dark';
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
      className={`btn ${showCopied ? 'btn-success' : 'btn-primary'}`}
      title={showCopied ? 'Link copied to clipboard!' : 'Copy shareable link'}
      type="button"
    >
      {showCopied ? <IconCheck size={14} /> : <IconShare size={14} />}
      <span>{showCopied ? 'Copied' : 'Share'}</span>
    </button>
  );
};