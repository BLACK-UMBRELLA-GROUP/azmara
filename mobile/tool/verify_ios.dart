import 'dart:convert';
import 'dart:io';

// Verify only the caller's exact AZMARA artifact. Never log full profiles/keys.
Future<void> main(List<String> arguments) async {
  if (arguments.length != 2) {
    throw ArgumentError(
      'Expected absolute Runner.app path and paired device UDID.',
    );
  }
  final app = Directory(arguments[0]);
  if (!app.isAbsolute ||
      !app.existsSync() ||
      !app.path.endsWith('/Runner.app')) {
    throw ArgumentError('A real absolute Runner.app path is required.');
  }
  final signature = await Process.run('/usr/bin/codesign', [
    '--verify',
    '--deep',
    '--strict',
    '--verbose=2',
    app.path,
  ]);
  if (signature.exitCode != 0) {
    throw StateError('Signature verification failed.');
  }
  final infoResult = await Process.run('/usr/bin/plutil', [
    '-convert',
    'json',
    '-o',
    '-',
    '${app.path}/Info.plist',
  ]);
  if (infoResult.exitCode != 0) throw StateError('Artifact plist unavailable.');
  final info = jsonDecode(infoResult.stdout as String) as Map<String, dynamic>;
  const bundle = 'com.shakeelahmad.azmara.preview';
  if (info['CFBundleIdentifier'] != bundle ||
      info['CFBundleDisplayName'] != 'AZMARA' ||
      info['CFBundleShortVersionString'] != '0.1.0' ||
      info['CFBundleVersion'] != '3' ||
      info['CFBundleExecutable'] != 'Runner') {
    throw StateError('Unexpected artifact identity.');
  }
  final decoded = await Process.run('/usr/bin/security', [
    'cms',
    '-D',
    '-i',
    '${app.path}/embedded.mobileprovision',
  ]);
  if (decoded.exitCode != 0) {
    throw StateError('Development profile unavailable.');
  }
  // Extract only non-secret fields; never serialize the complete profile's
  // certificates or dates into JSON or write the decoded profile to disk.
  Future<String> extract(String key, String format) async {
    final process = await Process.start('/usr/bin/plutil', [
      '-extract',
      key,
      format,
      '-o',
      '-',
      '-',
    ]);
    process.stdin.write(decoded.stdout);
    await process.stdin.close();
    final output = process.stdout.transform(utf8.decoder).join();
    final errors = process.stderr.transform(utf8.decoder).join();
    final result = await output;
    await errors;
    if (await process.exitCode != 0) {
      throw StateError('Cannot extract required development profile field.');
    }
    return result.trim();
  }

  const team = '9Y7Z8F36SJ';
  final entitlement =
      jsonDecode(await extract('Entitlements', 'json')) as Map<String, dynamic>;
  final identifier = entitlement['application-identifier'] as String?;
  final compatibleId =
      identifier == '$team.$bundle' ||
      (identifier != null &&
          identifier.endsWith('*') &&
          '$team.$bundle'.startsWith(
            identifier.substring(0, identifier.length - 1),
          ));
  final devices =
      jsonDecode(await extract('ProvisionedDevices', 'json')) as List<dynamic>;
  final expires = DateTime.parse(await extract('ExpirationDate', 'raw'));
  final teams =
      jsonDecode(await extract('TeamIdentifier', 'json')) as List<dynamic>;
  if (!teams.contains(team) ||
      !compatibleId ||
      entitlement['get-task-allow'] != true ||
      !devices.contains(arguments[1]) ||
      !expires.isAfter(DateTime.now())) {
    throw StateError(
      'Wrong team, app, development profile, expiry or device membership.',
    );
  }
  stdout.writeln(
    jsonEncode({
      'bundle': bundle,
      'name': info['CFBundleDisplayName'],
      'version': info['CFBundleShortVersionString'],
      'build': info['CFBundleVersion'],
      'executable': info['CFBundleExecutable'],
      'minimumOS': info['MinimumOSVersion'],
      'team': team,
      'developmentProfile': true,
      'profileExpires': expires.toIso8601String(),
      'deviceIncluded': true,
      'strictDeepSignature': true,
    }),
  );
}
