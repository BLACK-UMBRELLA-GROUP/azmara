import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'save_contract.dart';
import 'native_frame.dart';

const _deviceAudit = bool.fromEnvironment('AZMARA_DEVICE_AUDIT');

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const AZMARAPreview());
}

class AZMARAPreview extends StatelessWidget {
  const AZMARAPreview({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'AZMARA',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff304a38)),
      scaffoldBackgroundColor: const Color(0xff26372c),
    ),
    home: const NativeTown(),
  );
}

class NativeTown extends StatefulWidget {
  const NativeTown({super.key});

  @override
  State<NativeTown> createState() => _NativeTownState();
}

class _NativeTownState extends State<NativeTown> with WidgetsBindingObserver {
  WebViewController? _controller;
  SharedPreferencesAsync? _preferences;
  Future<void> _saveQueue = Future<void>.value();
  Timer? _startupTimer;
  String? _nativeTown;
  String? _legacy;
  String? _index;
  String? _failureMessage;
  int _generation = 0;
  int _lastSaveId = 0;
  bool _ready = false;
  bool _loaded = false;
  bool _failed = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    unawaited(_start());
  }

  Future<void> _start() async {
    final generation = ++_generation;
    _startupTimer?.cancel();
    setState(() {
      _controller = null;
      _failureMessage = null;
      _loaded = false;
      _failed = false;
      _ready = false;
      _index = null;
      _lastSaveId = 0;
    });
    _startupTimer = Timer(const Duration(seconds: 30), () {
      if (generation == _generation && !_loaded) {
        _fail(
          'The bundled town did not finish loading. Your saved town is unchanged.',
        );
      }
    });
    try {
      // A retry waits for any previous acknowledged write, never races it.
      await _saveQueue;
      final preferences = SharedPreferencesAsync();
      final town = await preferences.getString(SaveContract.key);
      if (town != null) SaveContract.parse(town);
      // The legacy key is hydration-only; this adapter never writes/removes it.
      final legacy = await preferences.getString(SaveContract.legacyKey);
      if (!mounted || generation != _generation || _failed) return;
      _preferences = preferences;
      _nativeTown = town;
      _legacy = legacy;
      final controller = WebViewController();
      await controller.setBackgroundColor(const Color(0xff26372c));
      await controller.setJavaScriptMode(JavaScriptMode.unrestricted);
      await controller.enableZoom(true);
      await controller.addJavaScriptChannel(
        'AZMARASave',
        onMessageReceived: (message) {
          if (generation == _generation && !_failed) {
            unawaited(_receive(message.message, generation));
          }
        },
      );
      await controller.setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (request) =>
              BundledNavigation.allowed(request.url, establishedIndex: _index)
              ? NavigationDecision.navigate
              : NavigationDecision.prevent,
          onWebResourceError: (error) {
            if (generation == _generation && error.isForMainFrame == true) {
              _fail(
                'The bundled game could not open. Your saved town is unchanged.',
              );
            }
          },
        ),
      );
      if (!mounted || generation != _generation || _failed) return;
      setState(() => _controller = controller);
      await controller.loadFlutterAsset('assets/game/index.html');
    } on FormatException {
      if (mounted && generation == _generation) {
        _fail(
          'The saved town needs a compatibility check. It has been preserved; no default town was written.',
        );
      }
    } catch (_) {
      if (mounted && generation == _generation) {
        _fail(
          'The game or its saved town could not be opened. Existing saves have been preserved.',
        );
      }
    }
  }

  Future<void> _receive(String raw, int generation) async {
    try {
      if (utf8.encode(raw).length > 8192) throw const FormatException();
      final message = jsonDecode(raw);
      if (message is! Map<String, dynamic>) throw const FormatException();
      switch (message['type']) {
        case 'ready':
          if (_ready || message.length != 1) throw const FormatException();
          final index = await _controller!.currentUrl();
          if (index == null || !BundledNavigation.allowed(index)) {
            throw const FormatException();
          }
          if (!mounted || generation != _generation || _failed) return;
          _index = index;
          _ready = true;
          await _controller!.runJavaScript(
            'window.AZMARA_NATIVE.hydrate(${jsonEncode({'town': _nativeTown, 'legacy': _legacy})});',
          );
        case 'save':
          if (!_ready ||
              message.length != 3 ||
              message['id'] is! int ||
              message['id'] != _lastSaveId + 1 ||
              message['value'] is! String) {
            throw const FormatException();
          }
          final id = message['id'] as int;
          final value = message['value'] as String;
          SaveContract.parse(value);
          _lastSaveId = id;
          _saveQueue = _saveQueue.then((_) async {
            if (generation != _generation || _failed) return;
            try {
              await _preferences!.setString(SaveContract.key, value);
              // Acknowledgement only follows persistence and a fresh readback.
              if (await _preferences!.getString(SaveContract.key) != value) {
                throw StateError('Native write readback mismatch.');
              }
              _nativeTown = value;
              if (mounted && generation == _generation && !_failed) {
                await _controller!.runJavaScript(
                  'window.AZMARA_NATIVE.ack($id);',
                );
                if (_deviceAudit) {
                  debugPrint(
                    'AZMARA_DEVICE_SAVE ${jsonEncode({'id': id, 'fingerprint': SaveContract.fingerprint(value), 'hallLevel': SaveContract.parse(value)['hallLevel']})}',
                  );
                }
              }
            } catch (_) {
              if (mounted && generation == _generation) {
                _fail(
                  'A town save could not be confirmed. Existing native data has not been reset; retry to reopen the last available saved town.',
                );
              }
            }
          });
        case 'loaded':
          if (!_ready ||
              _loaded ||
              message.length != 2 ||
              message['health'] is! Map<String, dynamic>) {
            throw const FormatException();
          }
          await _saveQueue;
          if (!mounted || generation != _generation || _failed) return;
          final health = message['health'] as Map<String, dynamic>;
          final town = _nativeTown;
          if (town == null ||
              health['plots'] != 23 ||
              health['empty'] != 22 ||
              health['occupied'] != 1 ||
              health['general'] != 19 ||
              health['wall'] != 1 ||
              health['harbour'] != 2 ||
              health['freighter'] != 1 ||
              health['imagesReady'] != true ||
              health['saved'] != true ||
              health['menu'] != true ||
              health['nativeZoom'] != true ||
              health['fingerprint'] != SaveContract.fingerprint(town) ||
              health['hallLevel'] != SaveContract.parse(town)['hallLevel']) {
            throw const FormatException();
          }
          _startupTimer?.cancel();
          setState(() => _loaded = true);
          if (_deviceAudit) {
            final safeHealth = <String, dynamic>{
              for (final key in [
                'plots',
                'empty',
                'occupied',
                'general',
                'wall',
                'harbour',
                'freighter',
                'imagesReady',
                'hallLevel',
                'construction',
                'saved',
                'nativePresent',
                'fingerprint',
                'width',
                'height',
                'menu',
                'nativeZoom',
              ])
                key: health[key],
            };
            debugPrint('AZMARA_DEVICE_READY ${jsonEncode(safeHealth)}');
          }
        case 'failed':
          _fail(
            'The game encountered a loading or save error. Your native save has not been reset.',
          );
        default:
          throw const FormatException();
      }
    } catch (_) {
      if (mounted && generation == _generation) {
        _fail(
          'The game save bridge could not confirm safe loading. Existing native data is preserved.',
        );
      }
    }
  }

  void _fail(String message) {
    if (!mounted || _failed) return;
    _startupTimer?.cancel();
    setState(() {
      _failed = true;
      _failureMessage = message;
    });
    if (_deviceAudit) debugPrint('AZMARA_DEVICE_FAILURE');
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _loaded && !_failed) {
      final generation = _generation;
      unawaited(
        _controller!.runJavaScript('window.AZMARA_NATIVE.resume();').catchError((
          Object _,
        ) {
          if (mounted && generation == _generation) {
            _fail(
              'The town could not resume safely. Retry to reopen the saved town.',
            );
          }
        }),
      );
    }
  }

  @override
  void dispose() {
    ++_generation;
    _failed = true;
    _startupTimer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => NativeTownFrame(
    game: _controller == null ? null : WebViewWidget(controller: _controller!),
    overlay: _loaded && !_failed
        ? null
        : Center(
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'AZMARA',
                    style: TextStyle(
                      color: Color(0xffeadfc2),
                      fontSize: 28,
                      letterSpacing: 4,
                    ),
                  ),
                  const SizedBox(height: 24),
                  if (_failureMessage == null) ...[
                    const CircularProgressIndicator(color: Color(0xffeadfc2)),
                    const SizedBox(height: 20),
                    const Text(
                      'Opening your town…',
                      style: TextStyle(color: Colors.white),
                    ),
                  ] else ...[
                    Text(
                      _failureMessage!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white),
                    ),
                    const SizedBox(height: 20),
                    FilledButton(
                      onPressed: () => unawaited(_start()),
                      child: const Text('Retry safely'),
                    ),
                  ],
                ],
              ),
            ),
          ),
  );
}
