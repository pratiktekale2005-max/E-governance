import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../core/platform_channel.dart';
import 'home_screen.dart';

final serverIpProvider = StateProvider<String>((ref) => "10.0.2.2"); // Default emulator host alias

class WebViewScreen extends ConsumerStatefulWidget {
  const WebViewScreen({super.key});

  @override
  ConsumerState<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends ConsumerState<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String _currentUrl = "";
  final TextEditingController _ipController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final ip = ref.read(serverIpProvider);
    _ipController.text = ip;
    _currentUrl = "http://$ip:3000";

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onNavigationRequest: (NavigationRequest request) async {
            final url = request.url;
            // Check if the user is navigating to a suggested official government portal
            if (url.contains("scholarships.gov.in") || 
                url.contains("pmkisan.gov.in") || 
                url.contains("myscheme.gov.in")) {
              
              // Automatically request overlay permission & launch the floating screen assistant!
              final hasOverlay = await PlatformChannel.checkOverlayPermission();
              if (!hasOverlay) {
                await PlatformChannel.requestOverlayPermission();
              }
              
              // Launch the floating head overlay
              await PlatformChannel.startFloatingHead();
              
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Portal Assist Activated! Tap the floating camera icon for help.'),
                  backgroundColor: Colors.purple,
                  duration: Duration(seconds: 4),
                ),
              );
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(_currentUrl));
  }

  void _reloadWithIp(String ip) {
    ref.read(serverIpProvider.notifier).state = ip;
    setState(() {
      _currentUrl = "http://$ip:3000";
    });
    _controller.loadRequest(Uri.parse(_currentUrl));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Saarthi AI Mobile OS', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.purple),
            onPressed: () => _showIpConfigDialog(),
            tooltip: "Configure Server IP",
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.purple),
            onPressed: () => _controller.reload(),
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: Colors.purple),
            ),
        ],
      ),
    );
  }

  void _showIpConfigDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Configure React Server IP'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enter your computer\'s local network IP address (e.g. 192.168.1.15) to load the React app on your phone:',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _ipController,
              decoration: const InputDecoration(
                labelText: 'Server IP Address',
                hintText: '10.0.2.2 or 192.168.1.XX',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final newIp = _ipController.text.trim();
              if (newIp.isNotEmpty) {
                _reloadWithIp(newIp);
              }
              Navigator.pop(context);
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }
}
