import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/platform_channel.dart';

final serviceStateProvider = StateProvider<bool>((ref) => false);

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isRunning = ref.watch(serviceStateProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Saarthi AI Assistant'),
        centerTitle: true,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                LucideIcons.cpu,
                size: 72,
                color: isRunning ? Colors.purple : Colors.grey,
              ),
              const SizedBox(height: 24),
              Text(
                isRunning ? 'Voice Assistant Active' : 'Assistant Deactivated',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Draw over other apps and select media capture permission parameters to run.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                onPressed: () async {
                  if (isRunning) {
                    await PlatformChannel.stopFloatingHead();
                    ref.read(serviceStateProvider.notifier).state = false;
                  } else {
                    final hasOverlay = await PlatformChannel.checkOverlayPermission();
                    if (!hasOverlay) {
                      final granted = await PlatformChannel.requestOverlayPermission();
                      if (!granted) return;
                    }
                    
                    final success = await PlatformChannel.startFloatingHead();
                    if (success) {
                      ref.read(serviceStateProvider.notifier).state = true;
                    }
                  }
                },
                icon: Icon(isRunning ? LucideIcons.stopCircle : LucideIcons.play),
                label: Text(isRunning ? 'Stop Assistant' : 'Launch Floating Assistant'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
