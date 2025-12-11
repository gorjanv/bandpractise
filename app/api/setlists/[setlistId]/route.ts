import { NextRequest, NextResponse } from 'next/server';
import { createServerClientForRoute } from '@/lib/supabase-server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ setlistId: string }> }
) {
  try {
    const supabase = createServerClientForRoute(request);
    const { setlistId } = await params;
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify setlist exists
    const { data: setlist, error: fetchError } = await supabase
      .from('setlists')
      .select('id')
      .eq('id', setlistId)
      .single();

    if (fetchError || !setlist) {
      return NextResponse.json(
        { error: 'Setlist not found' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('setlists')
      .delete()
      .eq('id', setlistId);

    if (error) {
      console.error('Error deleting setlist:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/setlists/[setlistId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

