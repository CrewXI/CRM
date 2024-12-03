'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '../ui/button';

export function GetUID() {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const copyToClipboard = () => {
    if (uid) {
      navigator.clipboard.writeText(uid);
    }
  };

  if (!uid) return <div>Please sign in to see your UID</div>;

  return (
    <div className="p-4 border rounded-lg bg-muted">
      <h3 className="font-semibold mb-2">Your User ID:</h3>
      <div className="flex items-center gap-2">
        <code className="bg-background p-2 rounded">{uid}</code>
        <Button onClick={copyToClipboard} variant="outline" size="sm">
          Copy
        </Button>
      </div>
    </div>
  );
}
