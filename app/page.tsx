'use client';

import { useState } from 'react';

import type { Author, FeedType } from '@/app/lib/types';

import { AuthorList } from '@/app/components/AuthorList';
import { Navigation } from '@/app/components/Navigation';
import { VideoFeed } from '@/app/components/VideoFeed';
import { useAuthors } from '@/app/hooks/useAuthors';
import { useVideoFeed } from '@/app/hooks/useVideoFeed';

export default function Home() {
  const [feedType, setFeedType] = useState<FeedType>('liked');
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [showAuthorList, setShowAuthorList] = useState(false);

  const { videos, isLoading, isLoadingMore, hasMore, loadMore } = useVideoFeed({
    type: feedType,
    authorId: selectedAuthor?.id,
  });

  const { authors, isLoading: authorsLoading } = useAuthors(true);

  const handleTypeChange = (type: FeedType) => {
    setFeedType(type);
    if (type !== 'following') {
      setSelectedAuthor(null);
    }
  };

  const handleAuthorSelect = (author: Author | null) => {
    setSelectedAuthor(author);
    setShowAuthorList(false);
  };

  return (
    <main className="relative min-h-screen bg-black">
      <Navigation
        currentType={feedType}
        onTypeChange={handleTypeChange}
        selectedAuthor={selectedAuthor}
        onAuthorSelect={handleAuthorSelect}
        onOpenAuthorList={() => setShowAuthorList(true)}
      />

      <VideoFeed
        videos={videos}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />

      {showAuthorList && (
        <AuthorList
          authors={authors}
          isLoading={authorsLoading}
          onSelect={handleAuthorSelect}
          onClose={() => setShowAuthorList(false)}
        />
      )}
    </main>
  );
}
