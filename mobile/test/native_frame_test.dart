import 'package:azmara_preview/native_frame.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const gameKey = Key('game');
  const overlayKey = Key('overlay');
  for (final example in [
    (
      name: 'portrait notch and home indicator',
      size: const Size(430, 932),
      insets: const FakeViewPadding(top: 59, bottom: 34),
      safeRect: const Rect.fromLTRB(0, 59, 430, 898),
    ),
    (
      name: 'landscape side cutouts',
      size: const Size(932, 430),
      insets: const FakeViewPadding(left: 59, right: 59, bottom: 21),
      safeRect: const Rect.fromLTRB(59, 0, 873, 409),
    ),
    (
      name: 'screen without insets',
      size: const Size(390, 844),
      insets: const FakeViewPadding(),
      safeRect: const Rect.fromLTRB(0, 0, 390, 844),
    ),
  ]) {
    testWidgets('town fills ${example.name}; only overlay is inset', (
      tester,
    ) async {
      tester.view.devicePixelRatio = 1;
      tester.view.physicalSize = example.size;
      tester.view.padding = example.insets;
      tester.view.viewPadding = example.insets;
      addTearDown(tester.view.reset);
      await tester.pumpWidget(
        const MaterialApp(
          home: NativeTownFrame(
            game: ColoredBox(key: gameKey, color: Colors.blue),
            overlay: SizedBox.expand(key: overlayKey),
          ),
        ),
      );
      expect(tester.getRect(find.byKey(gameKey)), Offset.zero & example.size);
      expect(tester.getRect(find.byKey(overlayKey)), example.safeRect);
      // Completing startup removes the overlay without shrinking the game.
      await tester.pumpWidget(
        const MaterialApp(
          home: NativeTownFrame(
            game: ColoredBox(key: gameKey, color: Colors.blue),
          ),
        ),
      );
      expect(find.byKey(overlayKey), findsNothing);
      expect(tester.getRect(find.byKey(gameKey)), Offset.zero & example.size);
      expect(tester.takeException(), isNull);
    });
  }
}
