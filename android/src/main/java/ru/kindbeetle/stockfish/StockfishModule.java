package ru.kindbeetle.stockfish;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.petero.droidfish.engine.ExternalEngine;
import org.petero.droidfish.engine.UCIEngineBase;
import org.petero.droidfish.engine.UCIEngine;

import java.util.Map;

import android.util.Log;

public class StockfishModule extends ReactContextBaseJavaModule {

  protected Thread engineMonitor;

  private UCIEngine engine;
  private ReactApplicationContext reactContext;

  public StockfishModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "Stockfish";
  }

  @ReactMethod
  public void createEngine(Promise promise) {
    Log.d("SStockfish", "startEngine");
    engine = UCIEngineBase.getEngine(this.reactContext.getApplicationContext(), "stockfish", new UCIEngine.Report() {
        @Override
        public void reportError(String errMsg) {
          if (errMsg == null) errMsg = "";
          Log.d("SStockfish", errMsg);
        }

        @Override
        public void reportStdOut(String stdOutLine) {
          if (stdOutLine == null) stdOutLine = "";
          Log.d("SStockfish", stdOutLine);
        }
    });
    Log.d("SStockfish", "startEngine preinit");
    engine.initialize();

    engineMonitor = new Thread(new Runnable() {
        public void run() {
          monitorLoop(engine);
        }
    });
    engineMonitor.start();
    promise.resolve(null);
  }

  protected void monitorLoop(UCIEngine engine) {
    while (true) {
      int timeout = getReadTimeout();
      if (Thread.currentThread().isInterrupted())
        return;
      String s = engine.readLineFromEngine(timeout);
      if ((s == null) || Thread.currentThread().isInterrupted())
        return;
      if (s.length() > 0) {
        Log.d("SStockfish", s);
        this.reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit("engine_data", s);
      }
      if (Thread.currentThread().isInterrupted())
        return;
      // notifyGUI();
      if (Thread.currentThread().isInterrupted())
        return;
    }
  }

  private final synchronized int getReadTimeout() {
    return 400;
  }

  public final synchronized void shutdownEngine() {
      if (engine != null) {
          engineMonitor.interrupt();
          engineMonitor = null;
          engine.shutDown();
          engine = null;
      }
  }

  @ReactMethod
  public void sendCommand(String command) {
    engine.writeLineToEngine(command);
  }

  @ReactMethod
  public void commit() {} // for ios compat

  @ReactMethod
  public void stop() {

  }
}