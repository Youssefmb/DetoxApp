package com.saifouf.DetoxApp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.graphics.drawable.Drawable;
import android.util.Base64;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.PixelFormat;
import android.graphics.drawable.BitmapDrawable;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

public class AppListeModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public AppListeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "AppListeModule";
    }

    @ReactMethod
    public void getInstalledApps(Promise promise) {
        try {
            PackageManager packageManager = reactContext.getPackageManager();
            List<ApplicationInfo> apps = packageManager.getInstalledApplications(PackageManager.GET_META_DATA);
            
            WritableArray appList = Arguments.createArray();
            
            for (ApplicationInfo appInfo : apps) {
                // Skip system apps if you want, or include them
                if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0) {
                    WritableMap appMap = Arguments.createMap();
                    
                    String appName = packageManager.getApplicationLabel(appInfo).toString();
                    String packageName = appInfo.packageName;
                    
                    appMap.putString("name", appName);
                    appMap.putString("packageName", packageName);
                    
                    // Get app icon and convert to base64
                    try {
                        Drawable icon = packageManager.getApplicationIcon(appInfo);
                        String iconBase64 = drawableToBase64(icon);
                        appMap.putString("icon", iconBase64);
                    } catch (Exception e) {
                        appMap.putString("icon", null);
                    }
                    
                    appList.pushMap(appMap);
                }
            }
            
            promise.resolve(appList);
        } catch (Exception e) {
            promise.reject("GET_APPS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getNonSystemApps(Promise promise) {
        try {
            PackageManager packageManager = reactContext.getPackageManager();
            List<ApplicationInfo> apps = packageManager.getInstalledApplications(PackageManager.GET_META_DATA);
            
            WritableArray appList = Arguments.createArray();
            
            for (ApplicationInfo appInfo : apps) {
                // Only include non-system apps and apps that can be launched
                if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0 && 
                    packageManager.getLaunchIntentForPackage(appInfo.packageName) != null) {
                    
                    WritableMap appMap = Arguments.createMap();
                    
                    String appName = packageManager.getApplicationLabel(appInfo).toString();
                    String packageName = appInfo.packageName;
                    
                    appMap.putString("name", appName);
                    appMap.putString("packageName", packageName);
                    
                    // Get app icon
                    try {
                        Drawable icon = packageManager.getApplicationIcon(appInfo);
                        String iconBase64 = drawableToBase64(icon);
                        appMap.putString("icon", iconBase64);
                    } catch (Exception e) {
                        appMap.putString("icon", null);
                    }
                    
                    appList.pushMap(appMap);
                }
            }
            
            promise.resolve(appList);
        } catch (Exception e) {
            promise.reject("GET_APPS_ERROR", e.getMessage());
        }
    }

    private String drawableToBase64(Drawable drawable) {
        try {
            Bitmap bitmap;
            
            if (drawable instanceof BitmapDrawable) {
                bitmap = ((BitmapDrawable) drawable).getBitmap();
            } else {
                // For other types of drawable, convert to bitmap
                if (drawable.getIntrinsicWidth() <= 0 || drawable.getIntrinsicHeight() <= 0) {
                    bitmap = Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888);
                } else {
                    bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(), 
                                                drawable.getIntrinsicHeight(), 
                                                Bitmap.Config.ARGB_8888);
                }
                
                Canvas canvas = new Canvas(bitmap);
                drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                drawable.draw(canvas);
            }
            
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
            byte[] byteArray = byteArrayOutputStream.toByteArray();
            return Base64.encodeToString(byteArray, Base64.DEFAULT);
            
        } catch (Exception e) {
            return null;
        }
    }
}