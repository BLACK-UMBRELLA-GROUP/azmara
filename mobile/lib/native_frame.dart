import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Paint the town beneath system bars, not inside their padding. The bundled
/// page's viewport-fit=cover and CSS safe-area insets protect its controls.
/// Only native loading/error content needs a Flutter SafeArea.
class NativeTownFrame extends StatelessWidget {
  const NativeTownFrame({super.key, this.game, this.overlay});

  final Widget? game;
  final Widget? overlay;

  @override
  Widget build(BuildContext context) => AnnotatedRegion<SystemUiOverlayStyle>(
    value: SystemUiOverlayStyle.light,
    child: Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          ?game,
          if (overlay != null)
            ColoredBox(
              color: const Color(0xff26372c),
              child: SafeArea(child: overlay!),
            ),
        ],
      ),
    ),
  );
}
