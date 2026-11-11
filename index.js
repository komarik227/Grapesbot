const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const express = require('express');

// Веб-сервер для хостинга
const app = express();
app.get('/', (req, res) => res.send('Бот SCP:SL работает 24/7!'));
app.listen(3000, () => console.log('Веб-сервер запущен.'));

// =================== НАСТРОЙКА БОТА ===================
const BOT_TOKEN = 'MTU2OTU3OTE3MDM4MjQ4MzQ4Ng.GO7OP2.kh-8rDAvTPqGCEkIx8LToQb8gOvqhzWpQRzBKQ'; 
const LOG_CHANNEL_ID = '1569591916977332224';
// =====================================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`🟢 Бот ${client.user.tag} запущен и готов к работе на сервере SCP:SL!`);
});

// Команда создания синей карточки с ДВУМЯ кнопками
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === '!создать_заявку') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_admin_modal')
                .setLabel('Norules')
                .setStyle(ButtonStyle.Primary), // Синяя кнопка
            new ButtonBuilder()
                .setCustomId('open_event_modal')
                .setLabel('🎉Ивент-Мастера')
                .setStyle(ButtonStyle.Success) // Зеленая кнопка
        );

        // ОБНОВЛЕННЫЙ ТЕКСТ С ТРЕБОВАНИЯМИ 13+ И 100 ЧАСОВ
        const embed = new EmbedBuilder()
            .setColor(0x0099FF) // Синий цвет
            .setTitle('🛡️ заявки в персонал - Grapes🍇')
            .setDescription('Вы хотите помогать нашему проекту? Выберите интересующую вас должность ниже и заполните анкету.\n\n**Минимальные требования для всех должностей:**\n• Возраст: **13+**\n• Наигранные часы в SCP:SL: **от 100 часов**\n• Наличие исправного микрофона и знание правил сервера.\n\n**🛡️ Администрация:**\nСледит за порядком, пресекает ТК, оскорбления и нарушения правил.\n\n**🎉 Ивент-Мастер:**\nПридумывает и проводит уникальные глобальные и локальные раунды/ивенты для игроков.')
            .setFooter({ text: 'Выберите должность ниже' });

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete().catch(() => {});
    }
});

// Отслеживание кликов по кнопкам и отправки анкет
client.on('interactionCreate', async (interaction) => {
    
    // 1. Игрок нажал кнопку "Заявка в Админку"
    if (interaction.isButton() && interaction.customId === 'open_admin_modal') {
        const modal = new ModalBuilder()
            .setCustomId('admin_modal_submit')
            .setTitle('Заявка в Администрацию SCP: SL');

        const nameInput = new TextInputBuilder().setCustomId('adm_name').setLabel('Ваш Ник и SteamID (или ссылка):').setStyle(TextInputStyle.Short).setPlaceholder('Пример: [Chaos] СБшник').setRequired(true);
        const ageInput = new TextInputBuilder().setCustomId('adm_age').setLabel('Ваш реальный возраст и часы в игре:').setStyle(TextInputStyle.Short).setPlaceholder('Пример: 14 лет, 120 часов').setRequired(true);
        const textInput = new TextInputBuilder().setCustomId('adm_text').setLabel('Был ли опыт? Почему хотите к нам?:').setStyle(TextInputStyle.Paragraph).setPlaceholder('Расскажите о себе здесь...').setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(ageInput), new ActionRowBuilder().addComponents(textInput));
        return interaction.showModal(modal);
    }

    // 2. Игрок нажал кнопку "Заявка в Ивент-Мастера"
    if (interaction.isButton() && interaction.customId === 'open_event_modal') {
        const modal = new ModalBuilder()
            .setCustomId('event_modal_submit')
            .setTitle('Заявка в Ивент-Мастера SCP: SL');

        const nameInput = new TextInputBuilder().setCustomId('evt_name').setLabel('Ваш Ник и SteamID (или ссылка):').setStyle(TextInputStyle.Short).setPlaceholder('Пример: ').setRequired(true);
        const ageInput = new TextInputBuilder().setCustomId('evt_age').setLabel('Ваш реальный возраст и часы в игре:').setStyle(TextInputStyle.Short).setPlaceholder('Пример: 13 лет, 150 часов').setRequired(true);
        const textInput = new TextInputBuilder().setCustomId('evt_text').setLabel('Какие ивенты вы умеете/хотите проводить?:').setStyle(TextInputStyle.Paragraph).setPlaceholder('Опишите примеры ваших ивентов (например, Прятки с дедом, Война группировок)...').setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(ageInput), new ActionRowBuilder().addComponents(textInput));
        return interaction.showModal(modal);
    }

    // 3. Обработка отправленной анкеты в Админку
    if (interaction.isModalSubmit() && interaction.customId === 'admin_modal_submit') {
        const name = interaction.fields.getTextInputValue('adm_name');
        const age = interaction.fields.getTextInputValue('adm_age');
        const text = interaction.fields.getTextInputValue('adm_text');

        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (!logChannel) return interaction.reply({ content: 'Ошибка: Канал для логов не найден.', ephemeral: true });

        const adminButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('admin_approve').setLabel('Принять').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('admin_reject').setLabel('Отклонить').setStyle(ButtonStyle.Danger)
        );

        const logText = `## 🛡️ Новая заявка в АДМИНИСТРАЦИЮ SCP: SL!\n**Отправитель:** ${interaction.user} (${interaction.user.tag})\n**Ник и профиль Steam:** ${name}\n**Возраст и часы:** ${age}\n**Опыт и мотивация:** ${text}\n\n*— UserID:${interaction.user.id} —*`;

        await logChannel.send({ content: logText, components: [adminButtons] });
        return interaction.reply({ content: '✅ Ваша заявка в администрацию успешно отправлена!', ephemeral: true });
    }

    // 4. Обработка отправленной анкеты в Ивент-Мастера
    if (interaction.isModalSubmit() && interaction.customId === 'event_modal_submit') {
        const name = interaction.fields.getTextInputValue('evt_name');
        const age = interaction.fields.getTextInputValue('evt_age');
        const text = interaction.fields.getTextInputValue('evt_text');

        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (!logChannel) return interaction.reply({ content: 'Ошибка: Канал для логов не найден.', ephemeral: true });

        const adminButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('admin_approve').setLabel('Принять').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('admin_reject').setLabel('Отклонить').setStyle(ButtonStyle.Danger)
        );

        const logText = `## 🎉 Новая заявка в ИВЕНТ-МАСТЕРА!\n**Отправитель:** ${interaction.user} (${interaction.user.tag})\n**Ник и профиль Steam:** ${name}\n**Возраст и часы:** ${age}\n**Идеи для ивентов:** ${text}\n\n*— UserID:${interaction.user.id} —*`;

        await logChannel.send({ content: logText, components: [adminButtons] });
        return interaction.reply({ content: '✅ Ваша заявка на пост ивент-мастера успешно отправлена!', ephemeral: true });
    }

    // 5. Админ нажал кнопки "Принять" или "Отклонить" в админ-канале
    if (interaction.isButton() && (interaction.customId === 'admin_approve' || interaction.customId === 'admin_reject')) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ У вас нет прав Администратора!', ephemeral: true });
        }

        const messageContent = interaction.message.content;
        if (!messageContent || !messageContent.includes('UserID:')) {
            return interaction.reply({ content: 'Ошибка: Не удалось определить ID пользователя.', ephemeral: true });
        }
        
        const targetUserId = messageContent.split('UserID:').split(' —').trim();

        try {
            const targetMember = await interaction.guild.members.fetch(targetUserId);

            if (interaction.customId === 'admin_approve') {
                await interaction.update({ content: `${messageContent}\n\n**🟢 ВЕРДИКТ:** Одобрено администратором ${interaction.user}.`, components: [] });
                await targetMember.send(`🎉 Поздравляем! Ваша заявка на сервере **${interaction.guild.name}** по SCP: SL была **Одобрена**!\n\nНапишите администрации, в какое время вам удобно пройти обзвон (по МСК).`).catch(() => {});
            } else {
                await interaction.update({ content: `${messageContent}\n\n**🔴 ВЕРДИКТ:** Отклонено администратором ${interaction.user}.`, components: [] });
                await targetMember.send(`🛑 К сожалению, ваша заявка на проекте **${interaction.guild.name}** была **Отклонена**.`).catch(() => {});
            }
        } catch (error) {
            await interaction.update({ content: `${messageContent}\n\n**⚠️ ОШИБКА:** Обработано ${interaction.user}, но игрок вышел с сервера или закрыл ЛС.`, components: [] });
        }
    }
});

client.login(BOT_TOKEN);
