package com.saifouf.DetoxApp;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

public class BlockerActivity extends Activity {
    private static final String TAG = "BlockerActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        String blockedPackage = getIntent().getStringExtra("blockedPackage");
        Log.d(TAG, "Blocked package (full): " + blockedPackage);

        Toast.makeText(this, "This app is restricted", Toast.LENGTH_SHORT).show();

        // Kick back to home
        Intent homeIntent = new Intent(Intent.ACTION_MAIN);
        homeIntent.addCategory(Intent.CATEGORY_HOME);
        homeIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(homeIntent);

        // Open MainActivity and let JS navigate to Restriction screen with the blocked package
        Intent mainIntent = new Intent(this, MainActivity.class);
        mainIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        mainIntent.putExtra("navigateToRestriction", true);
        mainIntent.putExtra("blockedPackage", blockedPackage);
        startActivity(mainIntent);

        finish();
    }
}
