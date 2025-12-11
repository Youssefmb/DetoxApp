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
import android.content.SharedPreferences;
import android.widget.Toast;
import android.content.pm.ServiceInfo;

import java.util.List;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.Calendar;
import java.util.Locale;

public class AppBlockingService extends Service {
    private static final String TAG = "AppBlockingService";
    private static final String PREFS_NAME = "DetoxAppPrefs";
    private static final String KEY_RESTRICTED_APPS = "restricted_apps";
    private Handler handler = new Handler();
    private Runnable runnable;
    private static final int CHECK_INTERVAL = 1000; // 1 second
    private String lastBlockedPackage = null;
    private long lastBlockTimestamp = 0L;
    private static final long BLOCK_COOLDOWN_MS = 3000;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        int notificationId = 1;
        Notification notification = createNotification();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            int serviceTypes = ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC;
            startForeground(notificationId, notification, serviceTypes);
        } else {
            startForeground(notificationId, notification);
        }
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
                if (isRestricted(foregroundApp)) {
                    blockApp(foregroundApp);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking foreground app: " + e.getMessage());
        }
    }

    private String getForegroundApp() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            UsageStatsManager usageStatsManager = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
            long now = System.currentTimeMillis();

            // Preferred: walk UsageEvents to get the latest MOVE_TO_FOREGROUND event
            try {
                android.app.usage.UsageEvents events = usageStatsManager.queryEvents(now - 1000 * 60, now);
                android.app.usage.UsageEvents.Event event = new android.app.usage.UsageEvents.Event();
                String latestPackage = null;
                long latestTime = 0L;
                while (events.hasNextEvent()) {
                    events.getNextEvent(event);
                    if (event.getEventType() == android.app.usage.UsageEvents.Event.MOVE_TO_FOREGROUND) {
                        if (event.getTimeStamp() > latestTime) {
                            latestTime = event.getTimeStamp();
                            latestPackage = event.getPackageName();
                            Log.d(TAG, "Detected foreground app (events): " + latestPackage);
                        }
                    }
                }
                if (latestPackage != null) {
                    return latestPackage; // full package name, e.g., com.facebook.katana
                }
            } catch (Exception ignored) {
                // fallback below
            }

            // Fallback: last-time-used stats
            List<UsageStats> stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, now - 1000 * 1000, now);
            if (stats != null) {
                SortedMap<Long, UsageStats> sortedStats = new TreeMap<>();
                for (UsageStats usageStats : stats) {
                    sortedStats.put(usageStats.getLastTimeUsed(), usageStats);
                }
                if (!sortedStats.isEmpty()) {
                    UsageStats top = sortedStats.get(sortedStats.lastKey());
                    if (top != null) {
                        return top.getPackageName(); // full package name
                    }
                }
            }
        }
        return null;
    }

    private boolean isRestricted(String packageName) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getStringSet(KEY_RESTRICTED_APPS, new java.util.HashSet<>()).contains(packageName);
    }

    private void blockApp(String packageName) {
        try {
            long now = System.currentTimeMillis();
            if (packageName.equals(lastBlockedPackage) && (now - lastBlockTimestamp) < BLOCK_COOLDOWN_MS) {
                return;
            }
            lastBlockedPackage = packageName;
            lastBlockTimestamp = now;

            // 1) Send restricted app to background (simulate pressing Home)
            Intent homeIntent = new Intent(Intent.ACTION_MAIN);
            homeIntent.addCategory(Intent.CATEGORY_HOME);
            homeIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(homeIntent);

            // 2) Launch our main app (Restricto) to foreground
            Intent launchIntent = getPackageManager().getLaunchIntentForPackage("com.saifouf.DetoxApp");
            if (launchIntent != null) {
                launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(launchIntent);
            }

            // 3) Optionally show blocker screen inside our app
            Intent blockerIntent = new Intent(this, BlockerActivity.class);
            blockerIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            blockerIntent.putExtra("blockedPackage", packageName);
            startActivity(blockerIntent);

            // 4) Feedback toast
            Toast.makeText(this, "Access blocked. Opening Restricto instead...", Toast.LENGTH_LONG).show();
            Log.d(TAG, "Blocked & redirected from: " + packageName);
        } catch (Exception e) {
            Log.e(TAG, "Failed to block app " + packageName + ": " + e.getMessage());
        }
    }
}

