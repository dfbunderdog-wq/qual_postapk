package com.wms.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Abilita debug WebView per Chrome DevTools
        WebView.setWebContentsDebuggingEnabled(true);
    }
}