import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NameHarmony() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [culture, setCulture] = useState('english');
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getScore = async () => {
    if (!firstName || !lastName || !culture) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first: firstName, last: lastName, culture })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data && typeof data.score === 'number') {
        setScore(data.score);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Unexpected error');
      setScore(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">Name Harmony Checker</h1>

      <div className="space-y-2">
        <Input
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value || '')}
        />
        <Input
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value || '')}
        />
        <Input
          placeholder="Culture (e.g., english, italian, chinese)"
          value={culture}
          onChange={(e) => setCulture(e.target.value || '')}
        />
        <Button onClick={getScore} disabled={loading}>
          {loading ? 'Scoring...' : 'Check Harmony'}
        </Button>
      </div>

      {error && (
        <div className="text-red-600 font-medium text-center">{error}</div>
      )}

      {score !== null && !error && (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-lg font-semibold">Harmony Score</p>
            <p className="text-4xl font-bold text-indigo-600">{score}/100</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
