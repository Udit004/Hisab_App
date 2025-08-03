import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';

interface CalculatorState {
  expression: string;
  cursorPosition: number;
  result: string;
  isResultShown: boolean;
  lastOperation: string | null;
}

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

interface SettingsState {
  soundEnabled: boolean;
}

interface ButtonProps {
  onPress: () => void;
  title: string;
  color?: string;
  textColor?: string;
  flex?: number;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  color = '#333',
  textColor = '#fff',
  flex = 1,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, {backgroundColor: color, flex}]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={[styles.buttonText, {color: textColor}]}>{title}</Text>
    </TouchableOpacity>
  );
};

const HistoryModal: React.FC<{
  visible: boolean;
  history: HistoryItem[];
  onClose: () => void;
  onClearHistory: () => void;
  onSelectItem: (item: HistoryItem) => void;
}> = ({visible, history, onClose, onClearHistory, onSelectItem}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group history by date
  const groupedHistory = history.reduce((groups: {[key: string]: HistoryItem[]}, item) => {
    const dateKey = formatDate(item.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
    return groups;
  }, {});

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all calculation history?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Clear', style: 'destructive', onPress: onClearHistory},
      ]
    );
  };

  const renderHistorySection = ({item}: {item: {date: string; items: HistoryItem[]}}) => (
    <View style={styles.historySection}>
      <Text style={styles.historyDateHeader}>{item.date}</Text>
      {item.items.map((historyItem) => (
        <TouchableOpacity
          key={historyItem.id}
          style={styles.historyItem}
          onPress={() => onSelectItem(historyItem)}>
          <View style={styles.historyItemContent}>
            <View style={styles.historyItemLeft}>
              <Text style={styles.historyExpression}>
                {historyItem.expression}
              </Text>
              <Text style={styles.historyResult}>
                = {historyItem.result}
              </Text>
            </View>
            <Text style={styles.historyTime}>
              {formatTime(historyItem.timestamp)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const historyData = Object.entries(groupedHistory).map(([date, items]) => ({
    date,
    items,
  }));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>History</Text>
          <View style={styles.headerButtons}>
            {history.length > 0 && (
              <TouchableOpacity onPress={handleClearHistory} style={styles.headerButton}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyHistoryContainer}>
            <Text style={styles.emptyHistoryIcon}>🧮</Text>
            <Text style={styles.emptyHistoryTitle}>No calculations yet</Text>
            <Text style={styles.emptyHistorySubtitle}>
              Your calculation history will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={historyData}
            renderItem={renderHistorySection}
            keyExtractor={(item) => item.date}
            style={styles.historyList}
            contentContainerStyle={styles.historyListContent}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const SettingsModal: React.FC<{
  visible: boolean;
  settings: SettingsState;
  onClose: () => void;
  onSettingsChange: (newSettings: SettingsState) => void;
}> = ({visible, settings, onClose, onSettingsChange}) => {
  const updateSetting = (key: keyof SettingsState, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.settingsContent}>
          {/* Sound Settings */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>Audio</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Button Sounds</Text>
              <TouchableOpacity
                style={[
                  styles.switch,
                  settings.soundEnabled && styles.switchOn,
                ]}
                onPress={() => updateSetting('soundEnabled', !settings.soundEnabled)}>
                <View
                  style={[
                    styles.switchThumb,
                    settings.soundEnabled && styles.switchThumbOn,
                  ]}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.settingDescription}>
              Play click sounds when pressing buttons (coming soon)
            </Text>
          </View>

          {/* About Section */}
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              Advanced Calculator with History & Cursor
              {'\n'}Version 2.1.0
              {'\n'}
              {'\n'}Features:
              {'\n'}• Cursor-based expression editing
              {'\n'}• Touch anywhere to position cursor
              {'\n'}• Complete calculation history
              {'\n'}• Real-time expression evaluation
              {'\n'}• Insert numbers/operators anywhere
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const Calculator: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    expression: '',
    cursorPosition: 0,
    result: '0',
    isResultShown: false,
    lastOperation: null,
  });

  const [settings, setSettings] = useState<SettingsState>({
    soundEnabled: false,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const insertAtCursor = (text: string) => {
    const {expression, cursorPosition, isResultShown} = state;
    
    let newExpression = expression;
    let newCursorPosition = cursorPosition;
    
    if (isResultShown && /[0-9.]/.test(text)) {
      // Start new expression if inserting number after result
      newExpression = text;
      newCursorPosition = 1;
    } else {
      // Insert at cursor position
      newExpression = expression.slice(0, cursorPosition) + text + expression.slice(cursorPosition);
      newCursorPosition = cursorPosition + text.length;
    }
    
    setState({
      ...state,
      expression: newExpression,
      cursorPosition: newCursorPosition,
      isResultShown: false,
      result: evaluateExpression(newExpression) || state.result,
    });
  };

  const deleteAtCursor = () => {
    const {expression, cursorPosition, isResultShown} = state;
    
    if (isResultShown) {
      // Clear everything if result is shown
      clear();
      return;
    }
    
    if (cursorPosition === 0 || expression.length === 0) {
      return; // Nothing to delete
    }
    
    const newExpression = expression.slice(0, cursorPosition - 1) + expression.slice(cursorPosition);
    const newCursorPosition = Math.max(0, cursorPosition - 1);
    
    setState({
      ...state,
      expression: newExpression,
      cursorPosition: newCursorPosition,
      result: evaluateExpression(newExpression) || '0',
    });
  };

  const moveCursor = (direction: 'left' | 'right') => {
    const {expression, cursorPosition} = state;
    
    let newPosition = cursorPosition;
    if (direction === 'left' && cursorPosition > 0) {
      newPosition = cursorPosition - 1;
    } else if (direction === 'right' && cursorPosition < expression.length) {
      newPosition = cursorPosition + 1;
    }
    
    setState({
      ...state,
      cursorPosition: newPosition,
    });
  };

  const setCursorPosition = (position: number) => {
    setState({
      ...state,
      cursorPosition: Math.max(0, Math.min(position, state.expression.length)),
    });
  };

  const evaluateExpression = (expr: string): string => {
    if (!expr || expr.trim() === '') return '';
    
    try {
      // Replace display operators with JavaScript operators
      let jsExpression = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\s+/g, ''); // Remove spaces
      
      // Check if expression is valid (basic validation)
      if (!/^[0-9+\-*/.() ]+$/.test(jsExpression)) {
        return '';
      }
      
      // Evaluate the expression
      const result = Function('"use strict"; return (' + jsExpression + ')')();
      
      if (isNaN(result) || !isFinite(result)) {
        return 'Error';
      }
      
      // Format result
      return parseFloat(result.toFixed(10)).toString();
    } catch (error) {
      return '';
    }
  };

  const addToHistory = (expression: string, result: string) => {
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      expression,
      result,
      timestamp: new Date(),
    };
    setHistory(prev => [historyItem, ...prev]);
  };

  const clear = () => {
    setState({
      expression: '',
      cursorPosition: 0,
      result: '0',
      isResultShown: false,
      lastOperation: null,
    });
  };

  const handleEquals = () => {
    const {expression} = state;
    const result = evaluateExpression(expression);
    
    if (result && result !== 'Error' && expression.trim() !== '') {
      addToHistory(expression, result);
      setState({
        ...state,
        result,
        isResultShown: true,
        lastOperation: expression,
        cursorPosition: 0,
      });
    }
  };

  const handlePercentage = () => {
    const {expression, cursorPosition} = state;
    
    // Find the number at or before cursor position
    let start = cursorPosition;
    let end = cursorPosition;
    
    // Move back to find start of number
    while (start > 0 && /[0-9.]/.test(expression[start - 1])) {
      start--;
    }
    
    // Move forward to find end of number
    while (end < expression.length && /[0-9.]/.test(expression[end])) {
      end++;
    }
    
    if (start < end) {
      const number = expression.slice(start, end);
      const value = parseFloat(number);
      if (!isNaN(value)) {
        const percentValue = (value / 100).toString();
        const newExpression = expression.slice(0, start) + percentValue + expression.slice(end);
        
        setState({
          ...state,
          expression: newExpression,
          cursorPosition: start + percentValue.length,
          result: evaluateExpression(newExpression) || state.result,
        });
      }
    }
  };

  const handlePlusMinus = () => {
    const {expression, cursorPosition} = state;
    
    // Find the number at or before cursor position
    let start = cursorPosition;
    let end = cursorPosition;
    
    // Move back to find start of number
    while (start > 0 && /[0-9.]/.test(expression[start - 1])) {
      start--;
    }
    
    // Move forward to find end of number
    while (end < expression.length && /[0-9.]/.test(expression[end])) {
      end++;
    }
    
    if (start < end) {
      const number = expression.slice(start, end);
      const newNumber = number.startsWith('-') ? number.slice(1) : '-' + number;
      const newExpression = expression.slice(0, start) + newNumber + expression.slice(end);
      
      setState({
        ...state,
        expression: newExpression,
        cursorPosition: start + newNumber.length,
        result: evaluateExpression(newExpression) || state.result,
      });
    }
  };

  const renderExpressionWithCursor = () => {
    const {expression, cursorPosition, isResultShown} = state;
    
    if (isResultShown) {
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.expressionScrollView}>
          <Text style={styles.expressionText}>
            {state.lastOperation} = {state.result}
          </Text>
        </ScrollView>
      );
    }
    
    if (expression === '') {
      return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.expressionScrollView}>
          <Text style={styles.expressionText}>
            <Text style={styles.cursor}>|</Text>
          </Text>
        </ScrollView>
      );
    }
    
    const beforeCursor = expression.slice(0, cursorPosition);
    const afterCursor = expression.slice(cursorPosition);
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.expressionScrollView}>
        <Text style={styles.expressionText}>
          {beforeCursor}
          <Text style={styles.cursor}>|</Text>
          {afterCursor}
        </Text>
      </ScrollView>
    );
  };

  const handleExpressionPress = (event: any) => {
    if (state.isResultShown) {
      // If result is shown, reset to new expression
      setState({
        ...state,
        expression: '',
        cursorPosition: 0,
        isResultShown: false,
        result: '0',
      });
      return;
    }

    // Calculate approximate cursor position based on touch
    const {expression} = state;
    if (expression.length === 0) return;

    const touchX = event.nativeEvent.locationX;
    
    // Rough estimation - this could be made more precise with text measurement
    // Assuming average character width of ~12px for the expression font
    const charWidth = 14;
    const estimatedPosition = Math.round(touchX / charWidth);
    const newPosition = Math.max(0, Math.min(estimatedPosition, expression.length));
    
    setCursorPosition(newPosition);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const selectHistoryItem = (item: HistoryItem) => {
    setState({
      expression: item.expression,
      cursorPosition: item.expression.length,
      result: item.result,
      isResultShown: false,
      lastOperation: null,
    });
    setShowHistory(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => setShowHistory(true)}
          style={styles.headerIconButton}>
          <Text style={styles.headerIconText}>📋</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setShowSettings(true)}
          style={styles.headerIconButton}>
          <Text style={styles.headerIconText}>⚙️</Text>
        </TouchableOpacity>
      </View>
      
      {/* Display */}
      <View style={styles.displayContainer}>
        {/* Expression Display with Cursor */}
        <TouchableWithoutFeedback onPress={handleExpressionPress}>
          <View style={styles.expressionContainer}>
            {renderExpressionWithCursor()}
          </View>
        </TouchableWithoutFeedback>
        
        {/* Result Display */}
        <View style={styles.resultContainer}>
          <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
            {state.result}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {/* Row 1 - Function buttons */}
        <View style={styles.row}>
          <Button
            title="C"
            onPress={clear}
            color="#a6a6a6"
            textColor="#000"
          />
          <Button
            title="⌫"
            onPress={deleteAtCursor}
            color="#a6a6a6"
            textColor="#000"
          />
          <Button
            title="◀"
            onPress={() => moveCursor('left')}
            color="#a6a6a6"
            textColor="#000"
          />
          <Button
            title="▶"
            onPress={() => moveCursor('right')}
            color="#a6a6a6"
            textColor="#000"
          />
        </View>

        {/* Row 2 - Special functions */}
        <View style={styles.row}>
          <Button
            title="±"
            onPress={handlePlusMinus}
            color="#a6a6a6"
            textColor="#000"
          />
          <Button
            title="%"
            onPress={handlePercentage}
            color="#a6a6a6"
            textColor="#000"
          />
          <Button
            title="("
            onPress={() => insertAtCursor('(')}
            color="#a6a6a6"
            textColor="#000"
          />
          <Button
            title=")"
            onPress={() => insertAtCursor(')')}
            color="#a6a6a6"
            textColor="#000"
          />
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          <Button title="7" onPress={() => insertAtCursor('7')} />
          <Button title="8" onPress={() => insertAtCursor('8')} />
          <Button title="9" onPress={() => insertAtCursor('9')} />
          <Button
            title="÷"
            onPress={() => insertAtCursor(' ÷ ')}
            color="#ff9500"
          />
        </View>

        {/* Row 4 */}
        <View style={styles.row}>
          <Button title="4" onPress={() => insertAtCursor('4')} />
          <Button title="5" onPress={() => insertAtCursor('5')} />
          <Button title="6" onPress={() => insertAtCursor('6')} />
          <Button
            title="×"
            onPress={() => insertAtCursor(' × ')}
            color="#ff9500"
          />
        </View>

        {/* Row 5 */}
        <View style={styles.row}>
          <Button title="1" onPress={() => insertAtCursor('1')} />
          <Button title="2" onPress={() => insertAtCursor('2')} />
          <Button title="3" onPress={() => insertAtCursor('3')} />
          <Button
            title="-"
            onPress={() => insertAtCursor(' - ')}
            color="#ff9500"
          />
        </View>

        {/* Row 6 */}
        <View style={styles.row}>
          <Button title="0" onPress={() => insertAtCursor('0')} />
          <Button title="." onPress={() => insertAtCursor('.')} />
          <Button title="=" onPress={handleEquals} color="#ff9500" />
          <Button
            title="+"
            onPress={() => insertAtCursor(' + ')}
            color="#ff9500"
          />
        </View>
      </View>

      {/* History Modal */}
      <HistoryModal
        visible={showHistory}
        history={history}
        onClose={() => setShowHistory(false)}
        onClearHistory={clearHistory}
        onSelectItem={selectHistoryItem}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        settings={settings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={setSettings}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerIconButton: {
    padding: 10,
  },
  headerIconText: {
    fontSize: 24,
    color: '#fff',
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  expressionContainer: {
    minHeight: 50,
    justifyContent: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 10,
  },
  expressionScrollView: {
    flex: 1,
  },
  expressionText: {
    color: '#888',
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'left',
    minHeight: 35,
  },
  cursor: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
  },
  resultContainer: {
    alignItems: 'flex-end',
    minHeight: 60,
    justifyContent: 'center',
  },
  displayText: {
    color: '#fff',
    fontSize: 50,
    fontWeight: '200',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 65,
    borderRadius: 32.5,
    marginHorizontal: 3,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '400',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 15,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#ff3b30',
    fontWeight: '600',
  },
  doneButtonText: {
    fontSize: 18,
    color: '#ff9500',
    fontWeight: '600',
  },
  
  // History Styles
  historyList: {
    flex: 1,
  },
  historyListContent: {
    padding: 20,
  },
  historySection: {
    marginBottom: 24,
  },
  historyDateHeader: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  historyItem: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  historyItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyItemLeft: {
    flex: 1,
  },
  historyExpression: {
    color: '#888',
    fontSize: 16,
    marginBottom: 4,
  },
  historyResult: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '300',
  },
  historyTime: {
    color: '#666',
    fontSize: 14,
    marginLeft: 16,
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistoryIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyHistoryTitle: {
    color: '#888',
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyHistorySubtitle: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Settings Styles
  settingsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#fff',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  aboutText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  
  // Custom Switch Styles
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#767577',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchOn: {
    backgroundColor: '#ff9500',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
});

export default Calculator;