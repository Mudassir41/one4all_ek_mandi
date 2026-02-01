import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services';
import { getOptionalUser } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = await getOptionalUser(request);

    const query = {
      text: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      subcategory: searchParams.get('subcategory') || undefined,
      location: {
        state: searchParams.get('state') || undefined,
        district: searchParams.get('district') || undefined,
        radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
        coordinates: searchParams.get('coordinates') ? 
          JSON.parse(searchParams.get('coordinates')!) : undefined
      },
      priceRange: searchParams.get('minPrice') || searchParams.get('maxPrice') ? {
        min: parseInt(searchParams.get('minPrice') || '0'),
        max: parseInt(searchParams.get('maxPrice') || '999999')
      } : undefined,
      buyerType: user?.userType === 'b2b_buyer' ? 'b2b' as const : 
                 user?.userType === 'b2c_buyer' ? 'b2c' as const : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'relevance',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const results = await productService.searchProducts(query);

    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Search products error:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getOptionalUser(request);
    const formData = await request.formData();

    // Handle voice search
    const voiceFile = formData.get('voiceAudio') as File;
    const language = formData.get('language') as string;
    
    if (!voiceFile || !language) {
      return NextResponse.json(
        { error: 'Voice audio and language are required for voice search' },
        { status: 400 }
      );
    }

    const audioBuffer = Buffer.from(await voiceFile.arrayBuffer());
    
    // Extract other search parameters
    const category = formData.get('category') as string;
    const location = formData.get('location') ? JSON.parse(formData.get('location') as string) : {};
    const priceRange = formData.get('priceRange') ? JSON.parse(formData.get('priceRange') as string) : undefined;

    const query = {
      voice: audioBuffer,
      language,
      category: category || undefined,
      location,
      priceRange,
      buyerType: user?.userType === 'b2b_buyer' ? 'b2b' as const : 
                 user?.userType === 'b2c_buyer' ? 'b2c' as const : undefined,
      limit: 20,
      offset: 0
    };

    const results = await productService.searchProducts(query);

    return NextResponse.json({
      success: true,
      ...results
    });
  } catch (error) {
    console.error('Voice search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform voice search' },
      { status: 500 }
    );
  }
}