import 'dart:convert';

/// The native adapter accepts the existing web prototype's v3 contract only.
/// It never repairs malformed native data by substituting a default town.
abstract final class SaveContract {
  static const key = 'azmara-town-layout-v3';
  static const legacyKey = 'azmara-town-design-v1';
  static const maximumBytes = 4096;

  static const _requiredTownKeys = {
    'version',
    'layoutId',
    'townName',
    'resources',
    'hallLevel',
    'construction',
  };
  static const _plotLayouts = {
    'staggered',
    'grid',
    'circle',
    'avenues',
    'garden-quarters',
  };
  static const _generalTypes = {
    'academy',
    'warehouse',
    'provision-house',
    'palace',
    'governors-residence',
    'museum',
    'embassy',
    'prayer-area',
    'trading-post',
    'depot',
    'military-exchange',
    'sea-chart-archive',
    'intelligence-house',
    'barracks',
    'workshop',
    'foresters-house',
    'silver-refinery',
    'iron-foundry',
    'grain-estate',
    'clayworks',
    'carpenters-workshop',
    'precision-workshop',
    'materials-workshop',
    'grain-store',
    'architects-office',
    'chronos-forge',
  };
  static const _resourceKeys = {'coins', 'timber', 'stone'};
  static const _hallId = 'general-01';
  static const _maxLevel = 50;
  static const _maxResource = 100000;
  static const _legacyConstructionMs = 10000;
  static const _constructionMs = 120000;

  static bool _keys(Map<String, dynamic> value, Set<String> expected) =>
      value.keys.toSet().containsAll(expected) &&
      value.length == expected.length;

  static bool _townKeys(Map<String, dynamic> value) {
    final keys = value.keys.toSet();
    return keys.containsAll(_requiredTownKeys);
  }

  static String? _plotRole(String id) {
    if (RegExp(r'^general-(0[1-9]|1[0-9])$').hasMatch(id)) return 'general';
    if (id == 'wall-01') return 'wall';
    if (id == 'harbour-01' || id == 'harbour-02') return 'harbour';
    if (id == 'freighter-01') return 'freighter';
    return null;
  }

  static bool _acceptsType(String plotId, Object? typeId) {
    if (typeId is! String || _plotRole(plotId) == null) return false;
    if (plotId == _hallId) return typeId == 'town-hall';
    return switch (_plotRole(plotId)) {
      'general' => _generalTypes.contains(typeId),
      'wall' => typeId == 'town-wall',
      'harbour' => typeId == 'trading-port' || typeId == 'shipyard',
      'freighter' => typeId == 'dockyard',
      _ => false,
    };
  }

  static bool _finiteNumber(Object? value) => value is num && value.isFinite;

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
        !_townKeys(value) ||
        value['version'] is! int ||
        value['version'] != 3 ||
        value['layoutId'] != 'town-23-v1' ||
        !validName(value['townName'])) {
      throw const FormatException('Invalid v3 town schema.');
    }
    final resources = value['resources'];
    if (resources is! Map<String, dynamic> ||
        !_resourceKeys.every(
          (key) =>
              resources[key] is int &&
              (resources[key] as int) >= 0 &&
              (resources[key] as int) <= _maxResource,
        )) {
      throw const FormatException('Invalid v3 resources.');
    }
    final level = value['hallLevel'];
    if (level is! int || level < 1 || level > _maxLevel) {
      throw const FormatException('Invalid v3 Hall level.');
    }

    final hallPlaced = value['hallPlaced'];
    if ((value.containsKey('hallPlaced') && hallPlaced is! bool) ||
        hallPlaced == false && level != 1) {
      throw const FormatException('Invalid v3 Hall placement.');
    }

    final buildings = value['buildings'];
    if (value.containsKey('buildings')) {
      if (buildings is! Map<String, dynamic> || buildings.length > 22) {
        throw const FormatException('Invalid v3 buildings.');
      }
      for (final entry in buildings.entries) {
        final building = entry.value;
        if (entry.key == _hallId ||
            _plotRole(entry.key) == null ||
            building is! Map<String, dynamic> ||
            !_keys(building, {'typeId', 'level'}) ||
            !_acceptsType(entry.key, building['typeId']) ||
            building['level'] is! int ||
            (building['level'] as int) < 1 ||
            (building['level'] as int) > _maxLevel) {
          throw const FormatException('Invalid v3 building placement.');
        }
      }
    }

    final construction = value['construction'];
    if (construction != null) {
      if (construction is! Map<String, dynamic>) {
        throw const FormatException('Invalid v3 construction queue.');
      }
      final buildingId = construction['buildingId'];
      if (buildingId is! String || _plotRole(buildingId) == null) {
        throw const FormatException('Invalid v3 construction plot.');
      }
      Map<String, dynamic>? built;
      if (buildingId == _hallId) {
        if (hallPlaced != false) {
          built = {'typeId': 'town-hall', 'level': level};
        }
      } else if (buildings is Map<String, dynamic> &&
          buildings[buildingId] is Map<String, dynamic>) {
        built = buildings[buildingId] as Map<String, dynamic>;
      }
      final typeId = construction.containsKey('typeId')
          ? construction['typeId']
          : buildingId == _hallId
          ? 'town-hall'
          : null;
      final targetLevel = built == null ? 1 : (built['level'] as int) + 1;
      if (!_acceptsType(buildingId, typeId) ||
          built != null && built['typeId'] != typeId ||
          construction['toLevel'] is! int ||
          construction['toLevel'] != targetLevel ||
          targetLevel > _maxLevel ||
          !_finiteNumber(construction['startedAt']) ||
          !_finiteNumber(construction['endsAt'])) {
        throw const FormatException('Invalid v3 construction queue.');
      }
      final duration =
          (construction['endsAt'] as num) - (construction['startedAt'] as num);
      if (duration == _legacyConstructionMs) {
        if (buildingId != _hallId ||
            hallPlaced == false ||
            targetLevel > 20 ||
            construction.containsKey('paidCost')) {
          throw const FormatException('Invalid legacy v3 construction queue.');
        }
      } else if (duration == _constructionMs) {
        final currentLevel = built == null ? 0 : built['level'] as int;
        final multiplier = currentLevel < 1 ? 1 : currentLevel;
        final expected = {
          'coins': 240 * multiplier,
          'timber': 130 * multiplier,
          'stone': 100 * multiplier,
        };
        final paidCost = construction['paidCost'];
        if (paidCost is! Map<String, dynamic> ||
            !_keys(paidCost, _resourceKeys) ||
            !expected.entries.every(
              (entry) =>
                  paidCost[entry.key] == entry.value &&
                  (resources[entry.key] as int) + entry.value <= _maxResource,
            )) {
          throw const FormatException('Invalid v3 construction cost.');
        }
      } else {
        throw const FormatException('Invalid v3 construction duration.');
      }
    }
    // Match the browser loader's retained semantic state. Unknown top-level and
    // resource fields are accepted but omitted; an invalid optional layout is
    // ignored. A validated construction object is retained verbatim, including
    // forward-compatible job metadata, exactly as the browser does.
    final retained = <String, dynamic>{
      'version': value['version'],
      'layoutId': value['layoutId'],
      'townName': value['townName'],
      'resources': <String, dynamic>{
        for (final key in _resourceKeys) key: resources[key],
      },
      'hallLevel': level,
      'construction': construction,
    };
    if (value.containsKey('hallPlaced')) {
      retained['hallPlaced'] = hallPlaced;
    }
    if (value.containsKey('buildings')) retained['buildings'] = buildings;
    if (_plotLayouts.contains(value['plotLayout'])) {
      retained['plotLayout'] = value['plotLayout'];
    }
    return retained;
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
