import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  saveFeedback,
  getFeedbackDetail,
} from "../../src/services/feedbackService";

type RewardType = "none" | "star" | "flower" | "badge";

const rewards: { key: RewardType; label: string }[] = [
  { key: "none", label: "Không thưởng" },
  { key: "star", label: "⭐ Sao" },
  { key: "flower", label: "🌸 Hoa hồng" },
  { key: "badge", label: "🏅 Huy hiệu" },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  student: any;
  classId: string;
  activityDate: any;   // Activity document (theo ngày)
  activityItem: any;   // Activity con
  date: string;
}

export default function FeedbackModal({
  visible,
  onClose,
  student,
  classId,
  activityDate,
  activityItem,
  date,
}: Props) {
  const [comment, setComment] = useState("");
  const [reward, setReward] = useState<RewardType>("none");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ===== LOAD EXISTING FEEDBACK ===== */
  useEffect(() => {
    if (visible && student && activityItem) {
      loadFeedback();
    }
  }, [visible, student, activityItem, date]);

  const loadFeedback = async () => {
    try {
      setLoading(true);

      const res = await getFeedbackDetail({
        studentId: student._id,
        activityItemId: activityItem._id,
        date,
      });

      if (res.data) {
        setComment(res.data.comment || "");
        setReward(res.data.reward || "none");
      } else {
        resetForm();
      }
    } catch (err) {
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setComment("");
    setReward("none");
  };

  const handleSave = async () => {
    console.log("SAVE FEEDBACK PAYLOAD", {
  studentId: student?._id,
  classId,
  activityDateId: activityDate?._id,
  activityItemId: activityItem?._id,
  date,
});
    if (!student || !activityDate || !activityItem) {
      Alert.alert("Thiếu thông tin feedback");
      return;
    }

    try {
      setSaving(true);

      await saveFeedback({
        studentId: student._id,
        classId,
        activityDateId: activityDate._id,
        activityItemId: activityItem._id,
        date,
        comment,
        reward,
      });

      Alert.alert("✅ Thành công", "Đã lưu feedback");
      onClose();
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Không thể lưu feedback"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            Feedback cho {student?.name}
          </Text>

          {/* Activity info */}
          {activityItem && (
            <View style={styles.activityBox}>
              <Text style={styles.activityTitle}>
                📘 {activityItem.title}
              </Text>
              <Text style={styles.activityTime}>
                ⏰ {activityItem.startTime} – {activityItem.endTime}
              </Text>
            </View>
          )}

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : (
            <>
              <TextInput
                placeholder="Nhận xét cho bé..."
                style={styles.input}
                multiline
                value={comment}
                onChangeText={setComment}
              />

              <View style={styles.rewardRow}>
                {rewards.map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    style={[
                      styles.rewardBtn,
                      reward === r.key && styles.rewardActive,
                    ]}
                    onPress={() => setReward(r.key)}
                  >
                    <Text
                      style={
                        reward === r.key
                          ? { color: "#fff", fontWeight: "700" }
                          : {}
                      }
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  saving && { opacity: 0.6 },
                ]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {saving ? "Đang lưu..." : "Lưu"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  onClose();
                }}
              >
                <Text style={styles.cancel}>Hủy</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },

  activityBox: {
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },

  activityTitle: {
    fontWeight: "700",
    color: "#065F46",
  },

  activityTime: {
    fontSize: 12,
    color: "#047857",
    marginTop: 2,
  },

  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },

  rewardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  rewardBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },

  rewardActive: {
    backgroundColor: "#10B981",
  },

  saveBtn: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  cancel: {
    textAlign: "center",
    marginTop: 10,
    color: "#6B7280",
  },
});
