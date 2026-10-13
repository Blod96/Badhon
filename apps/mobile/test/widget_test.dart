import 'package:flutter_test/flutter_test.dart';
import 'package:badhon_mobile/main.dart';

void main() {
  testWidgets('Badhon app smoke test and navigation verify', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const BadhonApp());

    // Verify that Badhon brand title is present
    expect(find.text('Badhon বাঁধন'), findsOneWidget);

    // Verify that navigation bar labels are rendered
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Donors'), findsOneWidget);
    expect(find.text('Requests'), findsOneWidget);
  });
}
