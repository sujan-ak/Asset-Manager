@echo off
echo ================================================
echo EDODWAJA - Pre-Flight Validation
echo ================================================
echo.

echo [1/7] Checking if we're in the mobile directory...
if not exist "package.json" (
    echo ❌ ERROR: package.json not found
    echo    Please run this from artifacts/mobile directory
    exit /b 1
)
echo ✅ In correct directory
echo.

echo [2/7] Checking for required files...
set missing=0
if not exist "app.json" (
    echo ❌ app.json missing
    set missing=1
)
if not exist "babel.config.js" (
    echo ❌ babel.config.js missing
    set missing=1
)
if not exist "metro.config.js" (
    echo ❌ metro.config.js missing
    set missing=1
)
if not exist "tsconfig.json" (
    echo ❌ tsconfig.json missing
    set missing=1
)
if not exist "expo-env.d.ts" (
    echo ❌ expo-env.d.ts missing
    set missing=1
)
if not exist "index.html" (
    echo ❌ index.html missing
    set missing=1
)
if %missing%==1 (
    echo ❌ Some required files are missing
    exit /b 1
)
echo ✅ All required files present
echo.

echo [3/7] Checking node_modules...
if not exist "node_modules" (
    echo ⚠️  node_modules not found
    echo    Run: pnpm install
    exit /b 1
)
echo ✅ node_modules exists
echo.

echo [4/7] Checking Expo CLI...
where expo >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Expo CLI not found globally
    echo    Will use: npx expo
) else (
    echo ✅ Expo CLI available
)
echo.

echo [5/7] Running TypeScript type check...
call pnpm typecheck >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ TypeScript errors found
    echo    Run: pnpm typecheck
    echo    to see details
    exit /b 1
)
echo ✅ No TypeScript errors
echo.

echo [6/7] Checking critical directories...
if not exist "app" (
    echo ❌ app directory missing
    exit /b 1
)
if not exist "components" (
    echo ❌ components directory missing
    exit /b 1
)
if not exist "context" (
    echo ❌ context directory missing
    exit /b 1
)
echo ✅ All directories present
echo.

echo [7/7] Checking for Replit remnants...
findstr /C:"REPLIT" /C:"replit.com" package.json app.json >nul 2>nul
if %errorlevel%==0 (
    echo ⚠️  Warning: Replit references still found
    echo    This may cause issues
) else (
    echo ✅ No Replit references found
)
echo.

echo ================================================
echo ✅ All Pre-Flight Checks Passed!
echo ================================================
echo.
echo You're ready to start the dev server:
echo.
echo   npx expo start
echo.
echo Or use:
echo   pnpm start
echo.
echo Then press:
echo   w - for web
echo   a - for Android
echo   i - for iOS
echo.
pause
