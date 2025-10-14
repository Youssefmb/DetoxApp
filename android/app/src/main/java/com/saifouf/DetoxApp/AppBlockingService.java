package com.saifouf.DetoxApp;

import android.app.Service;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;
import android.provider.Settings;
import android.app.UiModeManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;

import android.content.Context;
import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.Calendar;
import java.util.Locale;


public class AppBlockingService extends Service {
    private static final String TAG = "AppBlockingService";
    private Handler handler = new Handler();
    private Runnable runnable;
    private static final int CHECK_INTERVAL = 1000; // 1 second

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        startForeground(1, createNotification());
        Log.d(TAG, "AppBlockingService created");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startMonitoring();
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        stopMonitoring();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                "app_blocking_channel",
                "App Blocking Service",
                NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            manager.createNotificationChannel(channel);
        }
    }

    private Notification createNotification() {
        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, "app_blocking_channel");
        } else {
            builder = new Notification.Builder(this);
        }

        builder.setContentTitle("Restricto")
               .setContentText("Monitoring app usage")
               .setSmallIcon(android.R.drawable.ic_dialog_info);

        return builder.build();
    }

    private void startMonitoring() {
        runnable = new Runnable() {
            @Override
            public void run() {
                checkForegroundApp();
                handler.postDelayed(this, CHECK_INTERVAL);
            }
        };
        handler.postDelayed(runnable, CHECK_INTERVAL);
    }

    private void stopMonitoring() {
        if (handler != null && runnable != null) {
            handler.removeCallbacks(runnable);
        }
    }

    private void checkForegroundApp() {
        try {
            String foregroundApp = getForegroundApp();
            if (foregroundApp != null) {
                Log.d(TAG, "Foreground app: " + foregroundApp);
                // Here we would check if this app is restricted
                // and take action if needed
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking foreground app: " + e.getMessage());
        }
    }

    private String getForegroundApp() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            UsageStatsManager usageStatsManager = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
            long time = System.currentTimeMillis();
            List<UsageStats> stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 1000, time);
            
            if (stats != null) {
                SortedMap<Long, UsageStats> sortedStats = new TreeMap<>();
                for (UsageStats usageStats : stats) {
                    sortedStats.put(usageStats.getLastTimeUsed(), usageStats);
                }
                if (!sortedStats.isEmpty()) {
                    return sortedStats.get(sortedStats.lastKey()).getPackageName();
                }
            }
        }
        return null;
    }
}