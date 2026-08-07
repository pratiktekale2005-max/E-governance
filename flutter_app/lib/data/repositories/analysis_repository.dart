import 'dart:typed_data';
import 'package:dio/dio.dart';

class AnalysisResponse {
  final String error;
  final String explanation;
  final String solution;

  AnalysisResponse({
    required this.error,
    required this.explanation,
    required this.solution,
  });

  factory AnalysisResponse.fromJson(Map<String, dynamic> json) {
    return AnalysisResponse(
      error: json['error'] ?? '',
      explanation: json['explanation'] ?? '',
      solution: json['solution'] ?? '',
    );
  }
}

class AnalysisRepository {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: "http://10.0.2.2:8000/",
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
  ));

  Future<AnalysisResponse> analyzeScreenshot(Uint8List imageBytes) async {
    final multipartFile = MultipartFile.fromBytes(
      imageBytes,
      filename: "screenshot.png",
    );

    final formData = FormData.fromMap({
      "image": multipartFile,
    });

    final response = await _dio.post(
      "api/v1/analyze/analyze-image",
      data: formData,
    );

    if (response.statusCode == 200) {
      return AnalysisResponse.fromJson(response.data);
    } else {
      throw Exception("Failed to analyze screen content");
    }
  }
}
