import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await productService.getProductById(params.id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to get product' },
      { status: 500 }
    );
  }
}

async function handleUpdateProduct(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = request.user!;
    
    // Get existing product to check ownership
    const existingProduct = await productService.getProductById(params.id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Only the vendor who created the product can update it
    if (existingProduct.vendorId !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own products' },
        { status: 403 }
      );
    }

    const updates = await request.json();
    
    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.vendorId;
    delete updates.createdAt;

    const updatedProduct = await productService.updateProduct(params.id, updates);

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(handleUpdateProduct);