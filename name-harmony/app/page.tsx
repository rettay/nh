// app/page.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import NameGenerator from '@/components/NameGenerator';

export default function Page() {
  return <NameGenerator />;
}

