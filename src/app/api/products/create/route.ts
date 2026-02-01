import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

async function handleCreateProduct(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    
    // Only vendors can create products
    if (user.userType !== 'vendor') {
      return NextResponse.json(
        { error: 'Only vendors can create products' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    
    // Extract text data
    const textDescription = formData.get('textDescription') as string;
    const location = JSON.parse(formData.get('location') as string);
    const pricing = formData.get('pricing') ? JSON.parse(formData.get('pricing') as string) : undefined;
    const inventory = formData.get('inventory') ? JSON.parse(formData.get('inventory') as string) : undefined;
    const quality = formData.get('quality') ? JSON.parse(formData.get('quality') as string) : undefined;

    // Extract voice data
    let voiceDescription;
    const voiceFile = formData.get('voiceAudio') as File;
    const voiceLanguage = formData.get('voiceLanguage') as string;
    
    if (voiceFile && voiceLanguage) {
      const audioBuffer = Buffer.from(await voiceFile.arrayBuffer());
      voiceDescription = {
        audio: audioBuffer,
        language: voiceLanguage
      };
    }

    // Extract images
    const images: Buffer[] = [];
    let imageIndex = 0;
    while (true) {
      const imageFile = formData.get(`image${imageIndex}`) as File;
      if (!imageFile) break;
      
      images.push(Buffer.from(await imageFile.arrayBuffer()));
      imageIndex++;
    }

    const product = await productService.createProduct({
      vendorId: user.id,
      voiceDescription,
      textDescription,
      images: images.length > 0 ? images : undefined,
      location,
      pricing,
      inventory,
      quality
    });

    return NextResponse.json({
      success: true,
      product,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleCreateProduct);