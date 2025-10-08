#!/bin/bash

# Deploy to Vercel with real-time WebSocket updates

echo "🚀 Deploying Frontend with WebSocket Real-time Updates..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod --token WFCMgLP7nPfuTRZqIGEvIsLI

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your app is now live with WebSocket real-time updates!"
    echo "📊 Features:"
    echo "  ✓ Real-time progress updates"
    echo "  ✓ Zero polling (instant updates via WebSocket)"
    echo "  ✓ Beautiful animations with shadcn"
    echo "  ✓ Live connection indicator"
    echo ""
    echo "🔗 Access your app at: https://my-638wi247u-hamas-projects-104eb9bb.vercel.app/dashboard"
else
    echo "❌ Deployment failed!"
    exit 1
fi
