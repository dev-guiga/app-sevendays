# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_01_30_022421) do
  create_table "addresses", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "address", null: false
    t.string "city", null: false
    t.datetime "created_at", null: false
    t.string "neighborhood", null: false
    t.string "state", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_addresses_on_user_id", unique: true
  end

  create_table "diaries", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_diaries_on_user_id", unique: true
  end

  create_table "scheduling_rules", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "diary_id", null: false
    t.date "end_date"
    t.time "end_time", null: false
    t.datetime "session_duration_effective_at"
    t.integer "session_duration_minutes", default: 60, null: false
    t.integer "session_duration_minutes_next"
    t.date "start_date"
    t.time "start_time", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.json "week_days", null: false
    t.index ["diary_id", "user_id"], name: "index_scheduling_rules_on_diary_id_and_user_id", unique: true
    t.index ["diary_id"], name: "index_scheduling_rules_on_diary_id"
    t.index ["user_id"], name: "index_scheduling_rules_on_user_id"
  end

  create_table "schedulings", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "date", null: false
    t.text "description", null: false
    t.bigint "diary_id", null: false
    t.bigint "scheduling_rule_id", null: false
    t.integer "session_duration_minutes", default: 60, null: false
    t.string "status", default: "available", null: false
    t.time "time", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["diary_id"], name: "index_schedulings_on_diary_id"
    t.index ["scheduling_rule_id"], name: "index_schedulings_on_scheduling_rule_id"
    t.index ["user_id"], name: "index_schedulings_on_user_id"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.date "birth_date"
    t.string "cpf"
    t.datetime "created_at", null: false
    t.datetime "current_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "email", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "first_name"
    t.string "last_name"
    t.datetime "last_sign_in_at"
    t.string "last_sign_in_ip"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "sign_in_count", default: 0, null: false
    t.integer "status", default: 1
    t.datetime "updated_at", null: false
    t.string "username"
    t.index ["cpf"], name: "index_users_on_cpf", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "addresses", "users"
  add_foreign_key "diaries", "users"
  add_foreign_key "scheduling_rules", "diaries"
  add_foreign_key "scheduling_rules", "users"
  add_foreign_key "schedulings", "diaries"
  add_foreign_key "schedulings", "scheduling_rules"
  add_foreign_key "schedulings", "users"
end
