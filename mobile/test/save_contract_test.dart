import 'dart:convert';

import 'package:azmara_preview/save_contract.dart';
import 'package:flutter_test/flutter_test.dart';

Map<String, dynamic> town() => {
  'version': 3,
  'layoutId': 'town-23-v1',
  'townName': 'Your town',
  'resources': <String, dynamic>{'coins': 2400, 'timber': 760, 'stone': 540},
  'hallLevel': 1,
  'construction': null,
};

void main() {
  group('Native v3 save contract', () {
    test('accepts the canonical initial town without repairing its bytes', () {
      final raw = jsonEncode(town());
      expect(SaveContract.parse(raw), town());
      expect(raw, jsonEncode(town()));
    });

    test('preserves accepted names literally and uses UTF-16 length', () {
      final value = town()..['townName'] = ' <Town> ';
      expect(SaveContract.parse(jsonEncode(value))['townName'], ' <Town> ');
      expect(SaveContract.validName(List.filled(10, '🌴').join()), isTrue);
      expect(SaveContract.validName(List.filled(11, '🌴').join()), isFalse);
      for (final invalid in ['', '  ', null, 42, List.filled(21, 'x').join()]) {
        expect(SaveContract.validName(invalid), isFalse);
      }
    });

    for (final invalid in ['not json', '{}', 'null', '[]', '"text"']) {
      test('rejects malformed input $invalid, never returns a default', () {
        expect(() => SaveContract.parse(invalid), throwsFormatException);
      });
    }

    for (final field in [
      'version',
      'layoutId',
      'townName',
      'resources',
      'hallLevel',
      'construction',
    ]) {
      test('rejects a missing $field', () {
        final value = town()..remove(field);
        expect(
          () => SaveContract.parse(jsonEncode(value)),
          throwsFormatException,
        );
      });
    }

    test('rejects extra schema fields and foreign layouts', () {
      expect(
        () => SaveContract.parse(jsonEncode(town()..['extra'] = true)),
        throwsFormatException,
      );
      expect(
        () =>
            SaveContract.parse(jsonEncode(town()..['layoutId'] = 'town-6-v1')),
        throwsFormatException,
      );
      expect(
        () => SaveContract.parse(jsonEncode(town()..['version'] = 3.0)),
        throwsFormatException,
      );
    });

    for (final quantity in [-1, 100001, 1.5, '1', null]) {
      test('rejects invalid quantity $quantity', () {
        final value = town();
        value['resources']['timber'] = quantity;
        expect(
          () => SaveContract.parse(jsonEncode(value)),
          throwsFormatException,
        );
      });
    }

    test(
      'accepts resource bounds but not alternate or extra resource keys',
      () {
        final value = town();
        value['resources'] = {'coins': 0, 'timber': 100000, 'stone': 540};
        expect(SaveContract.parse(jsonEncode(value)), value);
        value['resources']['silver'] = 1;
        expect(
          () => SaveContract.parse(jsonEncode(value)),
          throwsFormatException,
        );
        value['resources'] = {'coins': 0, 'timber': 100000, 'clay': 540};
        expect(
          () => SaveContract.parse(jsonEncode(value)),
          throwsFormatException,
        );
      },
    );

    for (final level in [0, 21, 1.0, '1', null]) {
      test('rejects invalid Hall level $level', () {
        expect(
          () => SaveContract.parse(jsonEncode(town()..['hallLevel'] = level)),
          throwsFormatException,
        );
      });
    }

    test('accepts the exact demonstration queue, including expired jobs', () {
      final value = town();
      value['construction'] = {
        'buildingId': 'general-01',
        'toLevel': 2,
        'startedAt': 1000,
        'endsAt': 11000,
      };
      expect(SaveContract.parse(jsonEncode(value)), value);
    });

    for (final edit in <String, dynamic>{
      'buildingId': 'general-02',
      'toLevel': 3,
      'startedAt': 1001,
      'endsAt': null,
    }.entries) {
      test('rejects wrong queue ${edit.key}', () {
        final value = town();
        value['construction'] = <String, dynamic>{
          'buildingId': 'general-01',
          'toLevel': 2,
          'startedAt': 1000,
          'endsAt': 11000,
        };
        value['construction'][edit.key] = edit.value;
        expect(
          () => SaveContract.parse(jsonEncode(value)),
          throwsFormatException,
        );
      });
    }

    test('rejects a queue past max Hall level and oversized payload', () {
      final value = town()..['hallLevel'] = 20;
      value['construction'] = {
        'buildingId': 'general-01',
        'toLevel': 21,
        'startedAt': 1000,
        'endsAt': 11000,
      };
      expect(
        () => SaveContract.parse(jsonEncode(value)),
        throwsFormatException,
      );
      expect(
        () => SaveContract.parse(List.filled(4097, 'x').join()),
        throwsFormatException,
      );
    });

    test('comparison fingerprint matches standard and UTF-16 vectors', () {
      expect(SaveContract.fingerprint(''), '811c9dc5');
      expect(SaveContract.fingerprint('hello'), '4f9f2cab');
      // Unlike UTF-8 FNV, the bridge hashes the two JS UTF-16 code units.
      expect(SaveContract.fingerprint('🌴'), 'c52f40dd');
    });
  });

  group('Bundled-only top-level navigation', () {
    const index =
        'file:///private/container/Runner.app/Frameworks/App.framework/flutter_assets/assets/game/index.html';
    test('allows the bundled initial index and its own fragments', () {
      expect(BundledNavigation.allowed(index), isTrue);
      expect(
        BundledNavigation.allowed('$index#plot', establishedIndex: index),
        isTrue,
      );
    });
    for (final url in [
      'https://azmara-private-preview.blackumbreallagroup.chatgpt.site/',
      'https://example.com/assets/game/index.html',
      'javascript:alert(1)',
      'data:text/html,hello',
      'file://external/assets/game/index.html',
      'file:///private/secrets.txt',
      '$index?remote=true',
      'file:///different/container/assets/game/index.html',
      'about:blank',
    ]) {
      test('blocks $url after origin establishment', () {
        expect(
          BundledNavigation.allowed(url, establishedIndex: index),
          isFalse,
        );
      });
    }
  });
}
