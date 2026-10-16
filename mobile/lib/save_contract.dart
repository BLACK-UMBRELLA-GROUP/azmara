import 'dart:convert';

/// The native adapter accepts the existing web prototype's v3 contract only.
/// It never repairs malformed native data by substituting a default town.
abstract final class SaveContract {
  static const key = 'azmara-town-layout-v3';
  static const legacyKey = 'azmara-town-design-v1';
  static const maximumBytes = 4096;

  static bool _keys(Map<String, dynamic> value, Set<String> expected) =>
      value.keys.toSet().containsAll(expected) &&
      value.length == expected.length;

  static bool validName(Object? value) =>
      value is String &&
      value.trim().isNotEmpty &&
      value.length <= 20; // Dart length, like JS length, counts UTF-16 units.

  static Map<String, dynamic> parse(String raw) {
    if (utf8.encode(raw).length > maximumBytes) {
      throw const FormatException('Save exceeds the v3 size limit.');
    }
    final value = jsonDecode(raw);
    if (value is! Map<String, dynamic> ||
        !_keys(value, {
          'version',
          'layoutId',
          'townName',
          'resources',
          'hallLevel',
          'construction',
        }) ||
        value['version'] is! int ||
        value['version'] != 3 ||
        value['layoutId'] != 'town-23-v1' ||
        !validName(value['townName'])) {
      throw const FormatException('Invalid v3 town schema.');
    }
    final resources = value['resources'];
    if (resources is! Map<String, dynamic> ||
        !_keys(resources, {'coins', 'timber', 'stone'}) ||
        !resources.values.every(
          (quantity) => quantity is int && quantity >= 0 && quantity <= 100000,
        )) {
      throw const FormatException('Invalid v3 resources.');
    }
    final level = value['hallLevel'];
    if (level is! int || level < 1 || level > 20) {
      throw const FormatException('Invalid v3 Hall level.');
    }
    final construction = value['construction'];
    if (construction != null) {
      if (construction is! Map<String, dynamic> ||
          !_keys(construction, {
            'buildingId',
            'toLevel',
            'startedAt',
            'endsAt',
          }) ||
          construction['buildingId'] != 'general-01' ||
          construction['toLevel'] is! int ||
          construction['toLevel'] != level + 1 ||
          construction['toLevel'] > 20 ||
          construction['startedAt'] is! num ||
          construction['endsAt'] is! num ||
          !(construction['startedAt'] as num).isFinite ||
          !(construction['endsAt'] as num).isFinite ||
          construction['endsAt'] - construction['startedAt'] != 10000) {
        throw const FormatException('Invalid v3 construction queue.');
      }
    }
    return value;
  }

  /// A comparison marker only, matching the bootstrap's UTF-16 FNV-1a.
  /// This is not cryptographic integrity protection or player authentication.
  static String fingerprint(String raw) {
    var hash = 2166136261;
    for (final unit in raw.codeUnits) {
      hash = ((hash ^ unit) * 16777619) & 0xffffffff;
    }
    return hash.toRadixString(16).padLeft(8, '0');
  }
}

abstract final class BundledNavigation {
  static bool allowed(String url, {String? establishedIndex}) {
    final uri = Uri.tryParse(url);
    if (uri == null ||
        uri.scheme != 'file' ||
        uri.host.isNotEmpty ||
        uri.hasQuery ||
        !uri.path.endsWith('/assets/game/index.html')) {
      return false;
    }
    final withoutFragment = uri.replace(fragment: '').toString();
    return establishedIndex == null ||
        withoutFragment ==
            Uri.parse(establishedIndex).replace(fragment: '').toString();
  }
}
