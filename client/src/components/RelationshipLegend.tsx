import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Info } from 'lucide-react';

export default function RelationshipLegend() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          Relationship Types
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* One-to-Many */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 bg-blue-500 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-blue-500 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
            </div>
            <span className="font-semibold text-blue-600">One-to-Many</span>
            <span className="text-xs bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">Most Common</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 pl-14">
            One record in Table A relates to many records in Table B
          </p>
          <p className="text-xs text-gray-500 pl-14 italic">
            Example: One user → many posts
          </p>
        </div>

        {/* One-to-One */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 bg-green-500 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <span className="font-semibold text-green-600">One-to-One</span>
            <span className="text-xs bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded">Unique</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 pl-14">
            One record in Table A relates to exactly one record in Table B
          </p>
          <p className="text-xs text-gray-500 pl-14 italic">
            Example: One user → one user_profile
          </p>
        </div>

        {/* Many-to-Many */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-12 h-0.5 bg-purple-500 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <span className="font-semibold text-purple-600">Many-to-Many</span>
            <span className="text-xs bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">Via Junction</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 pl-14">
            Many records in Table A relate to many records in Table B (uses junction table)
          </p>
          <p className="text-xs text-gray-500 pl-14 italic">
            Example: Many students ↔ many courses (via enrollments)
          </p>
        </div>

        {/* How to Identify */}
        <div className="pt-2 border-t">
          <div className="font-semibold text-xs mb-2">How to Identify:</div>
          <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
            <li className="flex gap-2">
              <span className="text-blue-600">•</span>
              <span><strong>One-to-Many:</strong> FK column is not unique</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span><strong>One-to-One:</strong> FK column is unique or is the PK</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-600">•</span>
              <span><strong>Many-to-Many:</strong> Junction table with FKs to both tables</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}


