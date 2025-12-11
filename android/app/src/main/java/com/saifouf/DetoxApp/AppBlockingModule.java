package com.saifouf.DetoxApp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import android.content.Intent;
import android.content.Context;
import android.util.Log;
import android.content.SharedPreferences;
import java.util.HashSet;
import java.util.Set;

public class AppBlockingModule extends ReactContextBaseJavaModule {
    private static final String TAG = "AppBlockingModule";
    private final ReactApplicationContext reactContext;
    private static final String PREFS_NAME = "DetoxAppPrefs";
    private static final String KEY_RESTRICTED_APPS = "restricted_apps";

    public AppBlockingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "AppBlockingModule";
    }

    @ReactMethod
    public void startAppBlockingService() {
        try {
            Intent serviceIntent = new Intent(reactContext, AppBlockingService.class);
            reactContext.startService(serviceIntent);
            Log.d(TAG, "App blocking service started");
        } catch (Exception e) {
            Log.e(TAG, "Error starting service: " + e.getMessage());
        }
    }

    @ReactMethod
    public void stopAppBlockingService() {
        try {
            Intent serviceIntent = new Intent(reactContext, AppBlockingService.class);
            reactContext.stopService(serviceIntent);
            Log.d(TAG, "App blocking service stopped");
        } catch (Exception e) {
            Log.e(TAG, "Error stopping service: " + e.getMessage());
        }
    }

    @ReactMethod
    public void checkUsageStatsPermission(Promise promise) {
        try {
            boolean hasPermission = hasUsageStatsPermission();
            promise.resolve(hasPermission);
        } catch (Exception e) {
            promise.reject("PERMISSION_ERROR", e.getMessage());
        }
    }

    private boolean hasUsageStatsPermission() {
        // Implementation to check if usage stats permission is granted
        return true; // Simplified for now
    }

    @ReactMethod
    public void updateRestrictedApps(ReadableArray packageNames, Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            Set<String> packages = new HashSet<>();
            for (int i = 0; i < packageNames.size(); i++) {
                String pkg = packageNames.getString(i);
                if (pkg != null && !pkg.isEmpty()) {
                    packages.add(pkg);
                }
            }
            prefs.edit().putStringSet(KEY_RESTRICTED_APPS, packages).apply();
            promise.resolve(true);
            Log.d(TAG, "Updated restricted apps: " + packages.size());
        } catch (Exception e) {
            Log.e(TAG, "Failed to update restricted apps", e);
            promise.reject("UPDATE_FAILED", e);
        }
    }
}