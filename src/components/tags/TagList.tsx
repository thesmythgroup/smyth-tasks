'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/types';
import { TagItem } from './TagItem';
import { TagForm } from './TagForm';

export function TagList() {
  const tags = useSelector((state: RootState) => state.tags.items);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-100 mb-2">Manage Tags</h1>
        <p className="text-gray-400">
          Create and manage tags to organize your tasks.
        </p>
      </div>

      <TagForm />

      <div>
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">
          Existing Tags ({tags.length})
        </h2>
        {tags.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border-2 border-gray-700">
            <p className="text-gray-400 text-lg">
              No tags yet. Create your first tag above!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tags.map((tag) => (
              <TagItem key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
