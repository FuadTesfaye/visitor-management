'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StaffProfile() {
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Profile details are managed by the System Administrator.</p>
      </CardContent>
    </Card>
  );
}
