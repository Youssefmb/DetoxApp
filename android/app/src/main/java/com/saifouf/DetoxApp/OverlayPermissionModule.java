package com.saifouf.DetoxApp;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class OverlayPermissionModule extends ReactContextBaseJavaModule {

    private static final String TAG = "OverlayPermissionModule";
    private ReactApplicationContext reactContext;

    public OverlayPermissionModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "OverlayPermissionModule";
    }

    @ReactMethod
    public void checkOverlayPermission(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                boolean canDrawOverlays = Settings.canDrawOverlays(reactContext);
                promise.resolve(canDrawOverlays);
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking overlay permission: " + e.getMessage());
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void requestOverlayPermission(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + reactContext.getPackageName()));
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
            }
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error requesting overlay permission: " + e.getMessage());
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void checkUsageStatsPermission(Promise promise) {
        try {
            AppOpsManager appOps = (AppOpsManager) reactContext.getSystemService(Context.APP_OPS_SERVICE);
            int mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, 
                    android.os.Process.myUid(), reactContext.getPackageName());
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED);
        } catch (Exception e) {
            Log.e(TAG, "Error checking usage stats permission: " + e.getMessage());
            promise.resolve(false);
        }
    }
}